from flask import Flask
from flask import render_template
import modules.bible as bible
import os
scripture_data = bible.__bibleverses
bible_books = bible.__biblebooks
app = Flask(__name__,template_folder="templates",static_folder="static")
@app.route("/")
def index():
    return render_template("index.html",scripture_data=scripture_data,bible_books=bible_books)
if __name__=="__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run("0.0.0.0",port=port,debug=True)