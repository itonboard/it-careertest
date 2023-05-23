if [ $# -lt "1" ]; then
  echo "Please state your current environment, e.g. dev or live"
  exit 1
fi

PORT_NUM=""

if [ $1 = "dev" ]; then
  PORT_NUM="12801"
elif [ $1 = "live" ]; then
  PORT_NUM="64201"
else
  echo "Please state a valid environment, e.g. dev or live"
  exit 1
fi

[ ! -d .venv ] && python3.8 -m venv ./.venv
./.venv/bin/pip install -r requirements.txt
[ ! -d log ] && mkdir log
[ ! -f supervisord.conf ] && cat supervisord.sample.conf | sed "s/{{USER}}/$(id -un)/g" | sed "s/{{GROUP}}/$(id -gn)/g" | sed "s/{{DIR}}/$(pwd | sed 's/\//\\\//g')/g" > supervisord.conf
echo "FLASK_PORT=$PORT_NUM" > .port.env
cd react && npm i && npm run build