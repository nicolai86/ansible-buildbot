ansible-buildbot
================

example buildbot setup

```
vagrant up
ansible-playbook -i hosts playbook.yml --private-key ~/.vagrant.d/insecure_private_key
```

then visit 10.0.0.40:8010/

### examples

*trigger build via curl*

curl http://127.0.0.1:8011/change_hook/poller -d "poller=https://github.com/nicolai86/url_plumber.git"