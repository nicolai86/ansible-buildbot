# -*- python -*-
# ex: set syntax=python:

# This is a sample buildmaster config file. It must be installed as
# 'master.cfg' in your buildmaster's base directory.

# This is the dictionary that the buildmaster pays attention to. We also use
# a shorter alias to save typing.
c = BuildmasterConfig = {}

####### BUILDSLAVES

# The 'slaves' list defines the set of recognized buildslaves. Each element is
# a BuildSlave object, specifying a unique slave name and password.  The same
# slave name and password must be configured on the slave.
from buildbot.buildslave import BuildSlave
c['slaves'] = [
    {% for slave in buildbot_slaves %}
    BuildSlave("{{ slave.name }}", "{{ slave.password }}"),
    {% endfor %}
]

# 'slavePortnum' defines the TCP port to listen on for connections from slaves.
# This must match the value configured into the buildslaves (with their
# --master option)
c['slavePortnum'] = {{ buildbot_slave_port }}

####### CHANGESOURCES

# the 'change_source' setting tells the buildmaster how it should find out
# about source code changes.

from buildbot.changes.gitpoller import GitPoller
c['change_source'] = [
    GitPoller(
        "{{ buildbot_repository }}",
        workdir='gitpoller-workdir',
        branch="{{ buildbot_branch }}",
        pollinterval=300
    )
]

####### SCHEDULERS

# Configure the Schedulers, which decide how to react to incoming changes.  In this
# case, just kick off a 'runtests' build

from buildbot.schedulers.basic import SingleBranchScheduler
from buildbot.schedulers.forcesched import ForceScheduler
from buildbot.changes import filter
c['schedulers'] = [
    SingleBranchScheduler(
        name="all",
        change_filter=filter.ChangeFilter(branch="{{ buildbot_branch }}"),
        treeStableTimer=None,
        builderNames=["runtests"]
    ),
    ForceScheduler(
        name="force",
        builderNames=["runtests"]
    )
]

####### BUILDERS

# The 'builders' list defines the Builders, which tell Buildbot how to perform a build:
# what steps, and which slaves can execute them.  Note that any particular build will
# only take place on one slave.

from buildbot.process.factory import BuildFactory
from buildbot.steps.source.git import Git
from buildbot.steps.shell import ShellCommand

factory = BuildFactory()
# check out the source
factory.addStep(Git(repourl="{{ buildbot_repository }}", mode="incremental"))
# run the tests (note that this will require that 'trial' is installed)
{% for build_step in buildbot_build_steps %}
factory.addStep({{ build_step }})
{% endfor %}

from buildbot.config import BuilderConfig

c['builders'] = []
c['builders'].append(
    {% for slave in buildbot_slaves %}
    BuilderConfig(name="runtests",
      slavenames=["{{ slave.name }}"],
      factory=factory),
    {% endfor %}
)

####### STATUS TARGETS

# 'status' is a list of Status Targets. The results of each build will be
# pushed to these targets. buildbot/status/*.py has a variety to choose from,
# including web pages, email senders, and IRC bots.

c['status'] = []

from buildbot.status import html
from buildbot.status.web import authz, auth

authz_cfg=authz.Authz(
    # change any of these to True to enable; see the manual for more
    # options
    auth=auth.BasicAuth([("{{ buildbot_basic_auth_username }}","{{ buildbot_basic_auth_password }}")]),
    gracefulShutdown = False,
    forceBuild = 'auth', # use this to test your slave once it is set up
    forceAllBuilds = False,
    pingBuilder = False,
    stopBuild = False,
    stopAllBuilds = False,
    cancelPendingBuild = False,
)
c['status'].append(html.WebStatus(http_port={{ buildbot_web_port }}, authz=authz_cfg))

####### PROJECT IDENTITY

# the 'title' string will appear at the top of this buildbot
# installation's html.WebStatus home page (linked to the
# 'titleURL') and is embedded in the title of the waterfall HTML page.

c['title'] = "{{ buildbot_title }}"
c['titleURL'] = "{{ buildbot_project_url }}"

# the 'buildbotURL' string should point to the location where the buildbot's
# internal web server (usually the html.WebStatus page) is visible. This
# typically uses the port number set in the Waterfall 'status' entry, but
# with an externally-visible host name which the buildbot cannot figure out
# without some help.

c['buildbotURL'] = "http://{{ buildbot_web_host }}:{{ buildbot_web_port }}/"

####### DB URL

c['db'] = {
    # This specifies what database buildbot uses to store its state.  You can leave
    # this at its default for all but the largest installations.
    'db_url' : "sqlite:///state.sqlite",
}
