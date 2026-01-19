Video Transcript
Click on any timestamp or text to jump to that point in the video

Search transcript...
0:00
Okay, so we are done with uh development

0:03
of what I would consider to be the core

0:05
features here for the MVP. Uh like we

0:07
said, we're going to punt on the inapp

0:09
messaging. Uh we can do that in a later

0:11
video and that'll also give me

0:13
opportunity to show other things like

0:15
the git work trees and integrating with

0:17
third party APIs and whatnot. So, but I

0:21
think we've got like the core

0:22
functionality there now. So, we're ready

0:23
to deploy it. And if we wanted to look I

0:26
mean we've basically done all of this

0:33
added a database. So yeah so we are here

0:35
at this point. So the database we have

0:39
like we said this is a local MySQL

0:42
database. So this lives in the file

0:44
system. Uh that's not going to do us any

0:46
good once we deploy this app to Versell

0:49
where it's on the internet. So it needs

0:51
uh we need to host it in a production

0:54
way. And the way we're going to do that,

0:56
there's this service called Terso,

0:59
terso.te. So, this is what I use for uh

1:03
it's great. It can just basically import

1:05
a SQL uh database and they've got good

1:08
support for the LLM tools. Um so, I just

1:11
use the the CLI and it works perfect.

1:14
So, if we go here,

1:17
um I should be able I already have mine

1:18
linked up. like you will need to just

1:21
like you did with Versell, you need to

1:22
say uh Claude Code, please install the

1:24
Terso CLI and then authenticate it.

1:27
There's one step where it'll basically

1:29
pop open a browser window so it links it

1:31
with your account and then once you've

1:33
done that then you can interact with it

1:35
uh like you can have Claude talk to it

1:38
on your behalf and do stuff for you. So

1:41
mine's already linked up so I don't need

1:43
to do that but you'll need to do that.

1:45
And when you're ready, now the next

1:47
thing we need to do is we basically need

1:48
to say, "Okay, it's time to deploy our

1:52
app to production, and I would like you

1:54
to help me uh migrate basically create a

1:58
new database uh using use the Terso

2:03
use the Turso CLI to create a new

2:06
database and migrate our data into it."

2:10
uh and let me know and then update the

2:13
theenv.local

2:15
with the necessary database credentials

2:18
to access that database.

2:26
And this is where it's kind of nice.

2:28
This tool talktastic will like when you

2:31
have like a complete brain melt like I

2:33
just did, this will basically like uh

2:36
clean it up and make it more concise.

2:38
So, okay. So, we're ready to do that.

2:40
Let me make make sure using the TSO CLI.

2:43
Perfect. Okay. So, let's see. Let's turn

2:46
it loose

2:48
and hopefully it will actually go in

2:49
here and create this is the database for

2:53
uh for Vibe Code LEBA. I want it to

2:57
create a new one called Dog Tinder. I

2:59
didn't I should have told it that.

3:09
Uh, please name the database

3:14
dog Tinder.

3:33
It's kind of nice to be able to like

3:35
issue commands after the fact. clarify

3:38
something that you just said that you

3:39
forgot.

3:40
It's really cool that it incorporates

3:42
that. Okay, so it should do its thing

3:46
here. It looks like

3:59
See if it did it.

4:02
Okay. Yeah, there it is.

4:10
Now, it's worth talking about what a

4:12
migration is because you'll you'll hear

4:14
this term come up. And the best way to

4:16
think of it is like a recipe for how you

4:19
created the database. Databases consist

4:21
of like structure, which is typically

4:23
called the schema of the database, like

4:25
what tables and indices are involved in

4:28
it. Uh but then also the data is what

4:31
you inject into it. Like when we're

4:33
starting out fresh, we have some dummy

4:34
data here. So we would load that data

4:36
and that data is independent of the

4:38
structure of it. So here you can see

4:40
push schema to torso database. So it's

4:44
it's going to recreate all the tables

4:46
that we have in this

4:50
let's see database structure. So all

4:52
these tables with all these fields and

4:54
indices, it's going to go and actually

4:56
create that. And then as we work over

4:59
time, let's say we add, you know, that

5:00
inapp messages. We've already got the

5:02
messages table, but let's say we add, I

5:04
don't know, um, uh, let's some kind of

5:07
like social friend layer where we can

5:10
like add friends or something. So we

5:13
might have to need have a new table

5:14
called friends. The way that that's

5:16
added is by running a migration or it's

5:19
running one of these scripts that then

5:21
performs those changes on the database.

5:23
And the reason you do that is because

5:26
you need to be able to apply that script

5:27
in production, not just the local

5:30
database that you have here, but you

5:32
need to be able to apply that same

5:34
recipe. It's it's just like a recipe

5:36
that you can apply to something and it

5:37
changes it. So, so yeah, so I think

5:41
that's worth uh kind of like embedding

5:43
that term and knowing what that means.

5:45
But when anytime you hear migrations and

5:48
if if ever you deploy it and it's not

5:50
working, that's something to check is

5:52
did it run the migration. Uh now, if in

5:55
a later video I'll show you how to set

5:57
up like a proper CI/CD pipeline where

6:00
GitHub just does all this stuff for you.

6:02
Uh for now, we're going to be running

6:04
that migration. like if we make changes

6:06
and we deploy it, we're going to have to

6:07
then uh we'll use Terso CLI and we'll

6:10
say hey run the latest migration on

6:11
there. But it if if we have the GitHub

6:14
actions set up and we have a proper

6:16
CI/CD pipeline that actually just runs

6:18
that as part of the pipeline.

7:29
Okay, so it finished

7:32
and it says it added the different

7:36
the data. Let's go check.

7:41
So if we go edit data,

7:44
this lets us browse our thing. So there,

7:47
sure enough, there's the dogs and you

7:48
can see the all the fields.

7:52
And if you want, you know, you can kind

7:53
of spot check these if you want to check

7:55
it against

7:58
ID, shelter name, breed, age, gender,

8:00
size, description. ID, shelter name,

8:02
breed, age, gender, size, description.

8:05
So uh so yeah. So our both our structure

8:08
and our data is all there now which is

8:11
great

8:12
and let's see it it adapted so it added

8:18
the two credentials that we need

8:20
tov.local

8:22
and so we'll need those in a minute when

8:23
we deploy to versel

8:26
and

8:28
boom so we should be good to go. So here

8:30
we go. So for vers that's correct

8:35
okay so we're just going to keep it

8:36
rolling. And I'm not even going to make

8:37
this a separate video, but let's uh

8:39
let's do uh let's see, there's one thing

8:42
I wanted to do.

8:44
What was it? Oh, um okay, great. Can you

8:48
update our claude.md file to reflect the

8:51
fact that the production database is now

8:55
located on Turso and therefore you use

8:57
Terso CLI anytime you're interacting

8:59
with production, but primarily you

9:01
should only ever be interacting with

9:03
local. DB, which is our local SQLite

9:06
database.

9:12
And so what? Oops.

9:15
So, let me redo that. claw. MD. I guess

9:21
it didn't recognize it. Um, so what I'm

9:23
doing here is I'm telling it, let's just

9:27
reference it.

9:34
So we want to update this file.

9:36
Basically this is kind of like the

9:38
directives that run on every request. So

9:41
you can give it some kind of uh useful

9:44
instructions that just tell it how to

9:47
you know do things related to your

9:49
project. And so this is one of them is

9:51
it's key that it understand that ters is

9:54
now our production database and this

9:56
SQLite file is our local development

9:58
database. Because if you don't tell it

10:00
that uh and and let's say it gets kind

10:04
of it it for some reason thinks Terso is

10:06
the dev DB, it'll start making changes

10:08
directly in that and we don't want that

10:09
to happen. Okay, so it's done that. Um

10:13
let's go back and see what it said about

10:15
Versell because it already knows what

10:18
the next for deployment you need to.

10:24
So I'm just going to say I'm just going

10:26
to copy that. I'm going to say, um,

10:28
great. Can you use Versel CLI to add the

10:34
two environment variables

10:36
in

10:39
in the Versel project settings? Um, and

10:44
can you rename our Versel

10:48
project to uh dog Tinder? because right

10:54
now it's actually named I think it's

10:56
named app which is just super

10:59
nondescript. Yeah, app.

11:02
Um so we'll have it call it dog tuner so

11:04
we know which application it is.

11:15
Okay, so we apparently can't rename it

11:17
programmatically. So I'll just do this

11:18
via the Versell dashboard here. Not a

11:21
problem. uh dog Tinder

11:27
ID.

11:32
Uh I'm just going to copy this warning

11:34
because that's a little concerning. I

11:36
don't want to break anything.

11:39
Okay, I renamed it manually, but it

11:45
displayed this warning.

11:50
Do I need to be concerned

11:55
or will our integration

11:58
still work?

12:10
Okay. So, apparently we're not using

12:12
that feature, so we don't need to worry

12:13
about it. Um, so we're all good. Now,

12:17
what I want to do is I want to integrate

12:21
our git.

12:25
So connect get repository. So this is

12:27
what we want to do. Dog tinder

12:34
and

12:38
yeah I think we want to accept all those

12:41
just standard defaults. And what this

12:43
does is it makes it so that every time

12:47
uh a main gets updated so that when when

12:50
we commit code to the main branch it

12:52
actually triggers a deployment here. Now

12:54
a deployment we have none yet but we'll

12:57
have our first one here in theory if

12:59
this works.

13:01
So I am now going to go ahead and commit

13:03
these changes and let's see if this

13:07
hopefully triggers a deployment to

13:09
Versail.

13:16
So when we push that, it's really pretty

13:19
fast. Usually it appears. There you go.

13:21
See how it just comes up with a random

13:23
ID for it and it says building, but now

13:25
there's an error. So let's see what

13:27
that's all about.

13:30
Uh okay. So let's copy this and I'll say

13:34
okay I tried

13:36
uh deploying to versel

13:40
but it's throwing

13:44
this error and I just copy pasted it.

14:02
Okay, it's because it's not in the root.

14:04
It's because it lives in this

14:05
subdirectory called app

14:14
commit pushes change and redeploy.

14:23
So this little versel.json JSON

14:25
apparently tells it some preferences and

14:28
this can be one of them that it's using

14:31
the subdirectory app for the app. So

14:34
let's check it.

14:36
Uh go back here to

14:40
still throwing an error.

14:44
Let's see.

14:51
Where is it? Locks.

14:59
Okay. How do we do that before?

15:04
Yikes.

15:07
Tinder.

15:21
Okay. What just happened here? Error.

15:30
So where is the error? Usually we can

15:33
copy it.

15:35
Oh, here. This is it.

15:38
Uh I'm getting this

15:42
this error now.

15:53
Okay, so Claude tried something that was

15:55
illegal basically. So it must be

15:57
configured. Let me remove that file. Now

15:59
you need to go to root directory

16:01
settings general

16:04
root directory and change it to app

16:13
project ID

16:16
root

16:19
settings general see find root directory

16:26
versel dashboard

16:31
Okay, I'm not seeing

16:34
building deployment maybe. Yeah, here we

16:37
go. Root directory app.

16:45
Okay, let me take get rid of the slash

16:49
and

16:53
we get rid of this file and commit it

16:55
again.

17:00
And then we go back here to deployments.

17:06
Oh, we got to push it.

17:24
This is like one of those things where

17:26
you you do this once, you know, per

17:29
project. Usually, it's not even in a

17:31
subdirectory like that. So, uh little

17:35
snafoos like this, you get through them

17:37
and then you never deal with them again.

17:59
Okay, we got another error. So, let's

18:01
see what this is all about.

18:04
Just copy this

18:08
and

18:10
okay, that solved that issue, but I have

18:13
a new error.

18:16
Paste it.

18:35
Uh, okay. I've hit this before.

18:38
Go to

18:45
environment variables. Okay.

18:48
So we go to

18:51
a tender

18:53
settings

18:55
environment variables

18:58
database URL

19:01
edit

19:06
save and I'm guessing that the

19:10
the token as well is going to have the

19:13
same issue. So, let me just fix that

19:15
preemptively.

19:16
And it would be in the

19:21
local

19:23
grab this.

19:27
It's got to be exactly

19:30
no new line character, no space.

19:34
Let's grab that. Paste it in there.

19:44
save. And then let's

19:48
try redeploy.

19:52
And this just makes it so we don't have

19:54
to actually make another commit to

19:56
trigger deployment.

20:02
And let's see. So it's working now.

20:12
All right. And it looks like it aired

20:14
again. So, let's see what this is about.

20:23
That fixed it.

20:25
This is the next

20:27
error.

20:43
So, it's saying that that maybe that

20:45
didn't take.

20:50
Let's go back here.

20:54
Settings

20:55
variables

20:58
URL.

21:05
Come on.

21:11
edit.

21:13
Oh, there's a leading space.

21:16
It's just super picky. Redeploy.

21:23
And while it's doing that, I'm going to

21:26
uh tell it,

21:28
can you update the

21:31
claude MD file

21:34
to uh ensure that any secrets

21:40
uh any secrets in either Versel or other

21:45
systems

21:47
uh do not add the new line character

21:52
via

21:53
echo.

21:55
Uh, use the other method. I forget what

21:59
it's called, but there's like a another

22:01
substitute that doesn't add the new

22:03
line. Doesn't add the new line character

22:09
at the end.

22:11
So, you can give it these little

22:13
basically like anytime there's a

22:15
recurring mistake, uh, and I know I've

22:17
seen this one enough to know that it can

22:19
be a recurring problem. um you can

22:21
update your claude MD and it'll be

22:23
proactive about uh ensuring that doesn't

22:26
happen.

22:33
Okay, so let's see how this did if it

22:36
worked. View deployment. Okay, it's

22:39
ready to go. Let's look at it.

22:44
Dog tinder.

22:46
See if it still has alexagample.com

22:50
and password

22:52
one, two, three

22:55
server error. Okay, let's see what it's

22:56
doing now.

22:59
So, we have access to the logs here.

23:04
And there's all kinds of logs. So, I'm

23:07
This is So, this is another good

23:09
opportunity. So, I'm going to ask

23:12
Claude. I'm gonna say uh can you use

23:16
Versell CLI to access the logs of the

23:20
latest deployment?

23:24
The build worked.

23:26
However, there are quite

23:31
a few errors in the logs.

23:34
So, basically, it saves me the hassle of

23:37
having to like copy paste all this stuff

23:39
into

23:40
Claude. Uh, and again, it's all about

23:42
like how do we remove ourselves from the

23:44
equation and let it close the loop so

23:47
it's fully self-contained.

23:56
Okay. Actually, it apparently doesn't it

23:58
only shows like live streaming logs. It

24:00
doesn't show historical ones. So, I do

24:02
have to actually

24:04
copy paste these. Let me see if I can do

24:06
multiple simultaneously.

24:12
Uh, let's just see what it says.

24:19
I'll just do these 500.

24:24
What's the easiest way to do this?

24:28
Okay. Copy.

24:30
I'll just do the last couple here.

24:43
It sounds like the secrets aren't yet

24:45
set up.

24:48
So, I think you need to set up secrets

24:54
with different variables.

25:27
Okay, redeploy for the changes to take

25:29
effect.

25:31
So we can go here and say redeploy.

25:47
Should be noted that Versel has a crazy

25:50
good free plan. Like it's so generous.

25:54
You can see

25:56
here like the usage. I run the Vibe Code

25:59
Luge Boa site on here. There's another

26:01
site, this agent form one that runs on

26:03
here. And I'm not anywhere near hitting

26:06
my resource limits on this stuff. So,

26:09
these are all the the limits. The

26:11
closest one, I guess, is this fluid

26:13
active CPU. I'm not even sure what that

26:15
is. Um, but yeah, the point being is you

26:17
can scale a site and run it uh for a

26:21
pretty like without even paying for it

26:23
on Versel. It's pretty awesome.

26:26
Okay, let's go back and look at

26:29
deployments. This is building.

26:37
This shows you historically like the

26:40
build time.

26:41
And so we can expect to it for it to

26:44
finish right around the same because we

26:45
haven't really changed anything.

26:51
Okay, so it's ready to go.

26:54
So let's look at this now

27:00
and

27:02
alex

27:03
example.com.

27:06
Oops.

27:07
And password

27:09
one, two, three.

27:15
Okay, so it's working now.

27:21
Let's see if they're acrewing. Perfect.

27:26
Let's see if we can schedule an

27:27
appointment

27:36
and let's confirm that this data is all

27:39
appearing here. So,

27:42
uh sessions.

27:44
Let's reload it

27:49
and see the dogs are there. All right.

27:52
So, the likes are acrewing. So that we

27:55
know that it's basically working. There

27:56
should be one appointment request which

27:58
there is. So this is great. So this is

28:00
deployed. It's working.

28:03
It's working.

28:05
That meme the Anyways, um

28:11
good. So we are So this concludes this

28:15
section. We've gotten it live. We now

28:16
have our app out on the public internet.

28:19
It's talking to a production database

28:21
and we have a methodology now where

28:24
every time we commit code to main, it's

28:26
going to trigger a redeployment and push

28:29
that live in our production instance.

28:30
Now,

28:32
if you don't want like if you're

28:34
developing stuff and you want to be able

28:35
to like commit changes and preview it

28:37
and stuff that I'll I'll show that in a

28:39
different video. You're basically going

28:41
to use feature branches for that and

28:43
then you can actually have separate

28:45
branches which you can preview here. You

28:47
see how that little it kind of

28:49
corresponds to the same thing up here

28:50
with the the source control. So you can

28:53
actually have your own little

28:54
independent feature branches. But I am

28:56
going to do one more one more video. I

28:58
mean this basically concludes uh this

29:01
course. Uh I am going to do one last

29:03
video just to put some polish on this.

29:05
We're going to uh deploy it under a

29:07
custom domain. I got a a pretty clever

29:09
domain. And then we're going to I'm

29:11
going to show you the tools that I use

29:12
to find a new domain. how you do that

29:15
without uh like the safest way to do

29:18
that because there is something called

29:19
the Aaron request that is public and you

29:22
can get poached. Um I'm going to show