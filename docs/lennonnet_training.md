---
layout: simple
title: Game of Life
exclude: true
---

The code below is what I used to load the image classification model, modify it to my
needs and train it. Note that this is quite case and machine-specific, so I would not
recommend to copy-paste and run it just like that.

```python
import timm
import torch
from timm.data import resolve_data_config
from timm.data.transforms_factory import create_transform
from PIL import Image
import numpy as np
from torch.utils.data import Dataset, DataLoader, SubsetRandomSampler
import torch.nn.functional as F
import pytorch_lightning as pl
from torchvision.datasets import ImageFolder
```


```python
# Some settings for the sheet:
training_dir = 'images/training_john'
```


```python
class PersonClassifier(pl.LightningModule):
    def __init__(self,lr=1e-3,n_classes=2):
        """Define our Model as a subclass of a LightningModule from Pytorch-Lightning.
        Load the model from the timm library. RESNET50D seemed pretty good.
        """
        super().__init__()
        self.lr = lr
        self.save_hyperparameters()
        self.model = timm.create_model('resnet50d', pretrained=False, num_classes=n_classes)

    def configure_optimizers(self):
        opt= torch.optim.RMSprop(self.model.parameters(), self.lr)
        return opt
    
    def training_step(self, dl, idx):
        x,y = dl
        z = self.model(x)
        loss = F.cross_entropy(z,y)
        self.log('train_loss',loss)
        return loss
    
    def validation_step(self, dl, idx):
        x,y = dl
        z = self.model(x)
        loss = F.cross_entropy(z,y)
        self.log('val_loss',loss)
        return loss
    
    def forward(self, xs):
        return self.model(xs)  # we like to just call the model's forward method
```


```python
model = PersonClassifier()
# optional: use Tensor Board as a logger to check the progress of the training:
tb_logger = pl.loggers.TensorBoardLogger(save_dir="runs", log_graph=True)
# set up a checkpoint callback so we can keep the best-performing version:
checkpoint_callback = pl.callbacks.ModelCheckpoint(dirpath="lennonnet_checkpoints",
                                                   save_top_k=3,
                                                   monitor="val_loss")
# define the trainer (this can be very machine-specific!):
trainer = pl.Trainer(max_epochs=32,
                     logger=tb_logger,
                     accelerator="mps",
                     devices=1,
                     log_every_n_steps=5,
                     callbacks=[checkpoint_callback])
```

```python
# obtain the transforms of the data that are used in the model:
config = resolve_data_config({}, model=model)
transform = create_transform(**config)

# Load the training data into DataLoader objects so they can be fed to the trainer:
imgs= ImageFolder(training_dir, transform=transform)
imgs_dl= DataLoader(imgs, batch_size=32)

dataset_size = len(imgs)
dataset_indices = list(range(dataset_size))
np.random.shuffle(dataset_indices)
val_split_index = int(np.floor(0.1 * dataset_size)) # use 10% of the data for validation during training
train_idx, val_idx = dataset_indices[val_split_index:], dataset_indices[:val_split_index]
train_sampler = SubsetRandomSampler(train_idx)
val_sampler = SubsetRandomSampler(val_idx)

train_imgs= ImageFolder(training_dir, transform=transform)
train_dl= DataLoader(train_imgs,batch_size=32,sampler=train_sampler,num_workers=4)
val_imgs= ImageFolder(training_dir, transform=transform)
val_dl= DataLoader(val_imgs,batch_size=32,sampler=val_sampler,num_workers=4)

mapping = val_imgs.class_to_idx
model.mapping = mapping
model.transform = transform
print("mapping:", mapping)
```

```python
print("Dataset size:", dataset_size)
print("Training set size:", len(train_idx))
print("Validation set size:", len(val_idx))
print("Training number of batches:", len(train_dl))
print("Validation number of batches:", len(val_dl))
```

```python
# Run the actual training:
trainer.fit(model,train_dl,val_dl)
```