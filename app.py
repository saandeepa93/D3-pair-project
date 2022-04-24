from flask import Flask, render_template, request, url_for

import subprocess

app = Flask(__name__)

@app.route('/')
def index():
  return render_template("training.html")

@app.route('/training')
def training():
  return render_template("training.html", post_req=False)

@app.route('/inference')
def inference():
  return render_template("inference.html")

@app.route('/start', methods=['POST'])
def start():
  ret_val = subprocess.Popen(['sh', './ssh.sh'])
  return render_template('training.html', post_req=True)

@app.route('/infer')
def infer():
  ret_val = subprocess.call(['sh', './infer.sh'])
  return render_template('inference.html', post_req=True)


if __name__ == "__main__":
  app.run(debug=True)
  