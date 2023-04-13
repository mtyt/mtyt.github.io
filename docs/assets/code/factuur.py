from pypdf import PdfReader
import re
import pandas as pd

""" use RE to extract numbers:
1. find everything between "Elektriciteit: Samenstelling van uw amount"
 and "Gas: Samenstelling van uw amount"
2. convert dots to '' (thousands dividers) and ',' to '.' (decimal point)
3. Create a dataframe with columns vat - quantity - price per unit - amount (Excl vat)
each row in the table has a xx% and a €\n in it, for example:
Comfy night 6% 104.76  kWh 0.1079992  €/kWh 11,31  €\n

"""


class Factuur():
    def __init__(self, path, descriptions=None, month_year=None):
        """month_years should be a tuple with month and year that we want to get from invoice."""
        self.path = path
        if descriptions is None:
            descriptions = {}
            descriptions['bought day'] = "ComfyFlex dag"
            descriptions['bought night'] = "ComfyFlex nacht"
            descriptions['sold night'] = "ComfyFlex Vergoeding voor geïnjecteerde energie nacht"
            descriptions['sold day'] = "ComfyFlex Vergoeding voor geïnjecteerde energie dag"
        self.descriptions = descriptions
        
        self.month_year = month_year
        
    @staticmethod
    def pdf_to_string(factuur):
        reader = PdfReader(factuur)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return re.findall(r'(?s)Elektriciteit : Samenstelling van uw bedrag(.+)Gas: Samenstelling', text)[0].replace('.', '').replace(',', '.')
    
    @property
    def months_years(self):
        # obtain the months and years:
        my = re.findall(r"(?s)Periode : \d\d(\d\d)(\d\d\d\d)  - \d\d(\d\d)(\d\d\d\d)", self.table_str)
        return my
    
    def split_periods(self):
        # split per period
        table_str = self.table_str
        period_strings = re.findall(r"(?s)Periode : \d\d\d\d\d\d\d\d  - \d\d\d\d\d\d\d\d", table_str)
        periods = {}
        for i, ps in enumerate(period_strings):
            if i < len(period_strings)-1:
                text = re.findall(r"(?s)" + ps + r"(.+)" + period_strings[i+1], table_str)
            else:
                text = re.findall(r"(?s)" + ps + r"(.+)", table_str)
            if len(text) == 1:
                text = text[0]
            periods[self.months_years[i]] = text
        return periods

    @property
    def table_str(self):
        return self.pdf_to_string(self.path)

    @property
    def periods(self):
        periods = self.split_periods()
        return periods
    
    @property
    def period_strings(self):
        return self.periods.keys()
    
    @staticmethod
    def table_split(table_str):
        re_description = r'(.+)\s+'
        re_vat = r'(\S)\%\s+'
        re_quantity = r'([\d.]+)\s+'
        re_unit = r'(\w+)\s+'
        re_price_unit = r'([-.\d]+)\s+'
        re_eur_unit = r'([^\d]+)\s+'
        re_amount = r'([−.\d]+)\s+'
        table_split = re.findall(re_description +
                   re_vat +
                   re_quantity +
                   re_unit +
                   re_price_unit +
                   re_eur_unit +
                   re_amount +
                   r'€(?!/)', table_str)
        if len(table_split) == 1:
            table_split = table_split[0]
        return table_split
    
    @staticmethod
    def get_discount(table_str):
        split_discount = re.findall(r'(?s)Promo type.+([\d.]+)\%.+\nTotaal ([\d.]+)  €', table_str)
        if split_discount:
            discount_vat_pct = float(split_discount[0][0])
            discount = float(split_discount[0][1])
        else:
            discount_vat_pct, discount = 0, 0
        discount_inc_vat = discount*(1+discount_vat_pct/100)
        return discount, discount_vat_pct, discount_inc_vat
    
    @staticmethod
    def table_string_to_df(table_split):
        table_df =  pd.DataFrame(data=table_split,
                                 columns = ['description', 'vat [%]', 'quantity', 'unit', 'price per unit', 'euro per', 'amount excl vat'])
        table_df['vat [%]'] = table_df['vat [%]'].astype(float)
        table_df['quantity'] = table_df['quantity'].astype(float)
        table_df['price per unit'] = table_df['price per unit'].apply(lambda x: x.replace('−','-')).astype(float)
        table_df['amount excl vat'] = table_df['amount excl vat'].apply(lambda x: x.replace('−','-')).astype(float)
        table_df['amount incl vat'] = table_df['amount excl vat']*(1+table_df['vat [%]']/100)
        return table_df
    
    def monthly_df(self, table_df, discount_inc_vat):
        # All the costs per kWh added, split by day/night and sold/bought:
        df_per_kwh = table_df[table_df["euro per"].apply(lambda x: "kWh" in x)]
        mask_day = df_per_kwh["description"].apply(lambda x: not "night" in x)
        mask_night = df_per_kwh["description"].apply(lambda x: not "day" in x)
        mask_inj = df_per_kwh["price per unit"] < 0
        mask_afn = df_per_kwh["price per unit"] >= 0
        df_inj_day = df_per_kwh[mask_day & mask_inj]
        df_inj_night = df_per_kwh[mask_night & mask_inj]
        df_afn_day = df_per_kwh[mask_day & mask_afn]
        df_afn_night = df_per_kwh[mask_night & mask_afn]

        # all fixed costs:
        df_fixed = table_df[table_df["euro per"].apply(lambda x: "kWh" not in x)]

        df_month = pd.DataFrame(index=pd.Index(['day', 'night'], name="tarief"),
        columns=['bought', 'sold', "price per kWh", "received per kWh"])

        monthly_tot = pd.DataFrame(columns = ['fixed costs', 'discount', 'total costs bought', 'total compensation sold', 'total invoice'])

        # for sold en bought, day en night, get the sum of the cost/kWh + vat:
        df_month.loc['day', 'price per kWh'] = (df_afn_day['price per unit']*(1+df_afn_day['vat [%]']/100)).sum()
        df_month.loc['night', 'price per kWh'] = (df_afn_night['price per unit']*(1+df_afn_night['vat [%]']/100)).sum()
        df_month.loc['day', 'received per kWh'] = (df_inj_day['price per unit']*(1+df_inj_day['vat [%]']/100)).sum()
        df_month.loc['night', 'received per kWh'] = (df_inj_night['price per unit']*(1+df_inj_night['vat [%]']/100)).sum()
        
        # get the total day/night inj/afn from the descriptions:
        df_month.loc['day', 'bought'] = table_df[table_df['description'] == self.descriptions['bought day']].quantity.values[0]
        df_month.loc['night', 'bought'] = table_df[table_df['description'] == self.descriptions['bought night']].quantity.values[0]
        try:
            df_month.loc['day', 'sold'] = table_df[table_df['description'] == self.descriptions['sold day']].quantity.values[0]
        except IndexError:
            df_month.loc['day', 'sold'] = 0
        try:
            df_month.loc['night', 'sold'] = table_df[table_df['description'] == self.descriptions['sold night']].quantity.values[0]
        except IndexError:
            df_month.loc['night', 'sold'] = 0
            
        # total costs by kWh for day en night:
        df_month['kosten bought'] = df_month['bought']*df_month['price per kWh']
        df_month['vergoeding sold'] = df_month['sold']*df_month['received per kWh']

        # fixed costs and discount are not split by day/night so go in the monthly_tot df:
        monthly_tot['fixed costs'] = [df_fixed["amount incl vat"].sum()]
        monthly_tot['discount'] = - discount_inc_vat

        # so too the total energy costs and injection reimbursment:
        monthly_tot['total costs bought'] = df_month['kosten bought'].sum() # sum day and night
        monthly_tot['total compensation sold'] = df_month['vergoeding sold'].sum() # sum day and night

        monthly_tot['total invoice'] = (monthly_tot['fixed costs'] +
                                   monthly_tot['discount'] +
                                   monthly_tot['total costs bought'] +
                                   monthly_tot['total compensation sold'])
        return df_month, monthly_tot

    @property
    def period_df(self):
        period_df = {}
        
        for period, table_str in self.periods.items():
            if self.month_year is not None: # only get this month from invoice
                period_tuple = (*self.month_year, *self.month_year)
            else:
                period_tuple = period
            if period == period_tuple:
                table_split = self.table_split(table_str)
                discount, discount_vat_pct, discount_inc_vat = self.get_discount(table_str)
                table_df = self.table_string_to_df(table_split)
                df_month, monthly_tot = self.monthly_df(table_df, discount_inc_vat)
                return df_month, monthly_tot