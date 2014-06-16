[program:buildbot-master]
command=buildbot start --nodaemon master
autostart=true
autorestart=true
stopsignal=QUIT
stdout_logfile={{ buildbot_home }}/master/log/out.log
stderr_logfile={{ buildbot_home }}/master/log/err.log
user={{ buildbot_user }}
directory={{ buildbot_home }}
environment=USER="{{ buildbot_user }}",PYTHON_EGG_CACHE="{{ buildbot_home }}/.egg"

{% for slave in buildbot_slaves %}
[program:buildbot-slave-{{ slave.name }}]
command=buildslave start --nodaemon .
autostart=true
autorestart=true
stopsignal=QUIT
stdout_logfile={{ buildbot_home }}/slaves/{{ slave.name }}/log/out.log
stderr_logfile={{ buildbot_home }}/slaves/{{ slave.name }}/log/err.log
user={{ buildbot_user }}
directory={{ buildbot_home }}/slaves/{{ slave.name }}
environment=GEM_HOME="{{ buildbot_home }}/.gem",USER="{{ buildbot_user }}"
{% endfor %}
