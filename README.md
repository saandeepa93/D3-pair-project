# **Project 4 Skeleton**

## 1. Setup
```
pip install flask
```

## 2. Running the DashBoard
```
python3 app.py
```

## 3. [Deep Learning Code Repo](https://github.com/saandeepa93/project4UI.git)

* Clone the linked repo.

## **Hardcoded updates**
* Change the following paths.
    + **D3-pair-project > ssh.sh** - Update your local path for line 3 and line 6
    + **D3-pair-project > infer.sh** - Update your local path for line 3 and line 6 and add your checkpoint option --ckp for line 7
    + **deep_learning > logger.py** - Update csv path before ```/D3-pair-project``` in line 10 to your local.
    + **deep_learning > test.py** - Update csv path before ```/D3-pair-project``` in line 36 to your local.
    + **deep_learning > logger.py** - Update test image path before ```/D3-pair-project``` in line 58 to your local.

## **4. To test the visualization without realtime feature**
* Clone the visualization repo and perform step #2. This should automatically create a visualization on the dashboard.

## **5. To test the visualization with realtime feature.**
* Make the following updates

    + **D3-pair-project > app.py** - Uncomment line 21
    + **D3-pair-project > /templates/training.html** - Uncomment line 9
    + **D3-pair-project > /js/app.js** - Update line 11 to \
    ```data = d3.csv("/static/data/metrics.csv", row => {```
