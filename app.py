import flask
from weasyprint import HTML
from flask import Flask, request, Response
from jinja2 import Environment, FileSystemLoader
from datetime import date
import base64
import ssl
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate
import re
from dotenv import load_dotenv
import os
from typing import NoReturn, Literal
from waitress import serve
from bleach import clean
import mysql.connector
from uuid import uuid4
import logging

load_dotenv('.env')
load_dotenv('.port.env')

FLASK_PORT: int = int(os.getenv('FLASK_PORT'))

SMTP_SERVER: str = os.getenv('SMTP_SERVER')
SMTP_PORT: int = int(os.getenv('SMTP_PORT'))
SMTP_USER: str = os.getenv('SMTP_USER')
SMTP_PASS: str = os.getenv('SMTP_PASS')

MYSQL_HOST: str = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_NAME: str = os.getenv('MYSQL_NAME')
MYSQL_USER: str = os.getenv('MYSQL_USER')
MYSQL_PASS: str = os.getenv('MYSQL_PASS')
MYSQL_PORT: int = int(os.getenv('MYSQL_PORT', 3306))

if not all([MYSQL_NAME, MYSQL_USER, MYSQL_PASS]):
    raise Exception('Insufficient database configuration')

EMAIL_REGEX = re.compile(r"^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$")

with open('templates/assets/logo_ITONBOARD.svg', 'rb') as file:
    logo = 'data:image/svg+xml;base64,' + base64.b64encode(file.read()).decode('utf-8')
with open('templates/assets/ia_logo.png', 'rb') as file:
    ia_logo = 'data:image/png;base64,' + base64.b64encode(file.read()).decode('utf-8')
with open('templates/assets/tb_logo.jpg', 'rb') as file:
    tb_logo = 'data:image/jpeg;base64,' + base64.b64encode(file.read()).decode('utf-8')
with open('templates/assets/kup_logo.png', 'rb') as file:
    kup_logo = 'data:image/png;base64,' + base64.b64encode(file.read()).decode('utf-8')
with open('templates/assets/abstract_logo.png', 'rb') as file:
    abstract_logo = 'data:image/png;base64,' + base64.b64encode(file.read()).decode('utf-8')
with open('templates/assets/ifc_logo.jpg', 'rb') as file:
    ifc_logo = 'data:image/jpeg;base64,' + base64.b64encode(file.read()).decode('utf-8')


app = Flask(__name__, static_url_path='', static_folder='react/build')


env = Environment(loader=FileSystemLoader('.'))
template_de = env.get_template('templates/de.html')
template_en = env.get_template('templates/en.html')


def get_subject(lang: Literal['de', 'en']) -> str:
    if lang == 'de':
        return "Dein Ergebnis zum IT-spezifischen Berufsinteressentest des Erasmus+ Projektes ITONBOARD"
    if lang == 'en':
        return "Your result on the IT-specific career interest test of the Erasmus+ project ITONBOARD"


def get_body(lang: Literal['de', 'en'], first_name: str, last_name: str) -> str:
    if lang == 'de':
        return """Liebe:r %s %s,


vielen Dank für dein Interesse an unserem IT-spezifischen Berufsinteressentest und dein Vertrauen in uns. Es freut 
uns, dass dich das Thema Berufsorientierung interessiert und wir dir bei den ersten Schritten helfen können. 

Mit dieser E-Mail erhältst du von uns deinen personalisierten Ergebnisbericht. Wir haben dir eine Übersicht erstellt, 
wie stark dein Interesse in den einzelnen Berufsbereichen ist. Auf dieser Basis kannst du deine weiteren Recherchen 
aufbauen. 
 
Wir möchten dich ebenfalls erneut darauf hinweisen, dass wir keinerlei Daten von dir gespeichert haben. Dein 
Ergebnisbericht im Anhang ist das einzige Exemplar. Sollte dieses verloren gehen, lässt es sich unsererseits nicht 
wieder herstellen. Du kannst den IT-spezifischen Berufsinteressentest des Erasmus+ Projektes ITONBOARD natürlich 
jederzeit wiederholen. 

Solltest du noch Fragen haben, so kannst du dich gerne bei uns melden.

Wir wünschen dir viel Erfolg bei deiner beruflichen Orientierung und wünschen dir auf deinem Wege alles Gute.

Liebe Grüße

Das Team von ITONBOARD""" % (first_name, last_name)
    if lang == 'en':
        return """Dear %s %s,


Thank you for your interest in our IT-specific career test and your trust in us. We are pleased that you are 
interested in the topic of career orientation and that we can help you with the first steps. 

With this email, you will receive your personalized results report.
 
We have provided you with an overview of how strong your interest is in the individual occupational areas. You can 
use this as a basis for your further research. 

We would also like to point out once again that we have not stored any of your data. Your results report in the 
appendix is the only copy. Should it get lost, it cannot be recovered by us. You can of course repeat the IT-specific 
career interest test of the Erasmus+ project ITONBOARD at any time. 

If you have any questions, please do not hesitate to contact us.

We wish you all the best and every success in your career orientation.

Kind regards

The ITONBOARD team """ % (first_name, last_name)


@app.route('/IT-specific-career-test.pdf', methods=['POST'])
@app.route('/IT-spezifischer-berufsinteressentest.pdf', methods=['POST'])
def generate_pdf():
    [he, ha, se, ge, ka, pm, first_name, last_name, lang] = [
        parse_occupation_group_value(request.form.get('HE', '11')),
        parse_occupation_group_value(request.form.get('HA', '11')),
        parse_occupation_group_value(request.form.get('SE', '11')),
        parse_occupation_group_value(request.form.get('GE', '11')),
        parse_occupation_group_value(request.form.get('KA', '11')),
        parse_occupation_group_value(request.form.get('PM', '11')),
        clean(request.form.get('first_name', 'Erika')[0:48], tags=[]),
        clean(request.form.get('last_name', 'Musterfrau')[0:48], tags=[]),
        request.form.get('lang', 'en')
    ]

    pdf = render_pdf(he, ha, se, ge, ka, pm, first_name, last_name, lang)

    return Response(pdf, mimetype='application/pdf')


@app.route('/send', methods=['POST'])
def send_pdf():
    [he, ha, se, ge, ka, pm, first_name, last_name, address, lang] = [
        parse_occupation_group_value(request.form.get('HE', '11')),
        parse_occupation_group_value(request.form.get('HA', '11')),
        parse_occupation_group_value(request.form.get('SE', '11')),
        parse_occupation_group_value(request.form.get('GE', '11')),
        parse_occupation_group_value(request.form.get('KA', '11')),
        parse_occupation_group_value(request.form.get('PM', '11')),
        clean(request.form.get('first_name', 'Erika')[0:48], tags=[]),
        clean(request.form.get('last_name', 'Musterfrau')[0:48], tags=[]),
        request.form.get('address', ''),
        request.form.get('lang', 'en')
    ]

    if not is_email(address):
        return Response('address not provided or malformed', mimetype='text/plain', status=400)

    pdf = render_pdf(he, ha, se, ge, ka, pm, first_name, last_name, lang)

    send_email(
        address,
        get_subject(lang),
        get_body(lang, first_name, last_name),
        pdf,
        'IT-specific-career-test.pdf' if lang == 'de' else 'IT-spezifischer-berufsinteressentest.pdf'
    )
    return Response('', status=204)


@app.route('/')
def root():
    return app.send_static_file('index.html')


def send_email(send_to: str, subject: str, text: str, file_data: bytes, file_name: str) -> NoReturn:
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = send_to
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject

    msg.attach(MIMEText(text))

    pdf = MIMEApplication(file_data, 'pdf')
    pdf['Content-Disposition'] = 'attachment; filename="%s"' % file_name
    msg.attach(pdf)

    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    smtp = SMTP(SMTP_SERVER, SMTP_PORT)
    smtp.ehlo()
    smtp.starttls(context=context)
    smtp.ehlo()
    smtp.login(SMTP_USER, SMTP_PASS)
    smtp.sendmail(SMTP_USER, send_to, msg.as_string())
    smtp.close()


def parse_occupation_group_value(string: str) -> int:
    value = 0
    try:
        value = min(max(int(string), 11), 55)
    finally:
        return value


def is_email(test: str) -> bool:
    return bool(re.fullmatch(EMAIL_REGEX, test))


def render_pdf(he: int, ha: int, se: int, ge: int, ka: int, pm: int, first_name: str, last_name: str, lang: Literal['de', 'en']) -> bytes:
    template = template_en if lang == 'en' else template_de

    html = template.render({
        'he': he,
        'ha': ha,
        'se': se,
        'ge': ge,
        'ka': ka,
        'pm': pm,
        'first_name': first_name,
        'last_name': last_name,
        'he_y': get_pillar_y(he),
        'ha_y': get_pillar_y(ha),
        'se_y': get_pillar_y(se),
        'ge_y': get_pillar_y(ge),
        'ka_y': get_pillar_y(ka),
        'pm_y': get_pillar_y(pm),
        'he_height': get_pillar_height(he),
        'ha_height': get_pillar_height(ha),
        'se_height': get_pillar_height(se),
        'ge_height': get_pillar_height(ge),
        'ka_height': get_pillar_height(ka),
        'pm_height': get_pillar_height(pm),
        'he_label': get_pillar_label_y(he),
        'ha_label': get_pillar_label_y(ha),
        'se_label': get_pillar_label_y(se),
        'ge_label': get_pillar_label_y(ge),
        'ka_label': get_pillar_label_y(ka),
        'pm_label': get_pillar_label_y(pm),
        'logo': logo,
        'ia_logo': ia_logo,
        'tb_logo': tb_logo,
        'kup_logo': kup_logo,
        'abstract_logo': abstract_logo,
        'ifc_logo': ifc_logo,
        'date_iso': date.today().isoformat(),
        'date_str': date.today().strftime('%d.%m.%Y')
    })

    return HTML(string=html).write_pdf(None)


def get_pillar_y(value: int) -> float:
    return 5.5 + (55 - value) / 55 * 247.5


def get_pillar_height(value: int) -> float:
    return 247.5 * value / 55


def get_pillar_label_y(value: int) -> float:
    return 9 + (247.5 - value / 55 * 123.75)


@app.route('/client_started', methods=['POST'])
def add_client_to_db() -> Response:
    conn = None
    uuid = str(uuid4())
    status: Literal['success', 'failure'] = 'success'
    language = request.form.get('lang', None)

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            database=MYSQL_NAME,
            user=MYSQL_USER,
            password=MYSQL_PASS
        )

        if conn.is_connected():
            user_agent = request.user_agent.string

            cursor = conn.cursor()
            cursor.execute('INSERT INTO client (id, user_agent, language) VALUES(%s, %s, %s)', (uuid, user_agent, language))

            conn.commit()

    except mysql.connector.Error as e:
        logging.error(e)
        status = 'failure'

    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    return Response(uuid, 201) if status == 'success' else Response('', 500)


@app.route('/client_finished', methods=['POST'])
def set_client_finished() -> Response:
    conn = None
    uuid = request.form.get('id', None)
    language = request.form.get('lang', None)
    results = request.form.get('results', '{}')

    if uuid is None:
        return Response('UUID not provided', 400)

    status: Literal['success', 'failure', 'user_error'] = 'success'

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            database=MYSQL_NAME,
            user=MYSQL_USER,
            password=MYSQL_PASS
        )

        if conn.is_connected():
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE client SET finished = CURRENT_TIMESTAMP, language = %s, results = %s WHERE id = %s AND finished = 0',
                (language, results, uuid)
            )

            if cursor.rowcount == 0:
                status = 'user_error'

            conn.commit()

    except mysql.connector.Error as e:
        logging.error(e)
        status = 'failure'

    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    if status == 'success':
        Response('', 201)
    elif status == 'user_error':
        Response('', 409)
    else:
        Response('', 500)


if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=FLASK_PORT)
