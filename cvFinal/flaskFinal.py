from flask import Flask, render_template
from flask import send_from_directory
import os
from flask import request
import socket

mytext = (socket.gethostbyname(socket.gethostname()))

app = Flask(__name__)
app._static_folder = "./templates/static"

@app.route("/")
def index():
    return render_template("index.html", text = mytext)

if __name__ == "__main__":
    app.run(host=mytext, port="443", debug=True, ssl_context=('server.crt', 'server.key'))
