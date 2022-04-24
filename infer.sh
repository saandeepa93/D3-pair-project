#!/bin/bash
echo "TRAINING START"
cd /home/saandeepaath/Desktop/projects/usf/dataviz/deep_learning
ls
set -e
. /home/saandeepaath/Desktop/projects/usf/dataviz/deep_learning/.venv/bin/activate
CUDA_VISIBLE_DEVICES=0 python test.py --dataset mnist --root ~/Projects/fg/fractional_glow/data/ --batch 32 --n_chan 1 --n_class 10 --img_size 28 --iter 100 --lr 1e-4 --ckp /home/saandeepaath/Desktop/projects/usf/dataviz/deep_learning/checkpoint/model_091.pt