from flask import Flask
from flask import render_template
from flask import make_response
from flask import jsonify
import json
import modules.bible as bible
scripture_data = bible.__bibleverses
bible_books = bible.__biblebooks
app = Flask(__name__,template_folder="templates",static_folder="static")
@app.route("/")
def index():
    return render_template("index.html",scripture_data=scripture_data,bible_books=bible_books)
@app.route("/get_scripture")
def get_scripture():
    return jsonify(message=bible.getScripture())
if __name__=="__main__":
    app.run("0.0.0.0",port=5000,debug=True)