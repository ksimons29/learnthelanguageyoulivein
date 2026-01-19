Transcripts Vibecodelisboa 

Claude Code 101: 5 Build the app screens


Transcript



0:00
Okay, so we are done with the
0:02
architectural review portion and we are
0:04
now transitioning into the build phase
0:07
here. Here's where we start we we move
0:09
from a model of what we're trying to
0:11
create to the actual thing that we're
0:13
trying to build. So this is where it
0:14
gets fun. Uh if we were taking a
0:17
development first approach, this is
0:19
where we just dive in and we'd uh point
0:21
Claude at our GitHub issues and we just
0:23
say go and it would start building.
0:25
We're not going to do that just yet. Um,
0:27
if you remember two videos ago, I
0:30
mentioned why we're doing the design
0:31
first approach. Um, if you need to find
0:34
that, you can go back here. It's this
0:37
lesson and then you can find the link in
0:39
the uh show notes pile for it. Um, if
0:42
you want to read that article, but
0:43
basically the reason to do this is to
0:45
reduce waste. And waste comes in the
0:47
form of developing stuff that's wrong.
0:50
uh we the the reason to stub out all the
0:53
screens first is we get uh we know
0:56
exactly how the app is going to work. We
0:57
can see it. We can correct issues before
0:59
we start building any of the backend,
1:01
you know, the plumbing and the wiring uh
1:03
with the database and API and all that
1:06
stuff. So, uh so we're going to start
1:08
with the front end design first
1:09
approach. That's what we're going to do
1:10
right now. Um I have just launched a new
1:13
instance of Claude. If you are still
1:15
continuing from the last lesson where we
1:17
did the architectural review, you'll
1:18
want to run the clear command. And the
1:21
clear, what that does is it clears
1:22
context and it frees up your your
1:25
context window. And remember, this is
1:27
the the command you run /context. It'll
1:30
give you that visual representation that
1:32
shows you it's basically like how full
1:34
is your gas tank, right? Like we want
1:36
empty context. And so clear frees up
1:39
context for uh for us to be able to use
1:41
it. So we should have a fresh instance
1:44
now uh fresh session of claude and uh so
1:48
yeah so what we're going to do is we're
1:50
basically going to say uh taking into
1:52
account
1:54
account the implementation
1:59
uh can you please uh make all the
2:05
screens in mock
2:09
uh please turn all the screens
2:17
in Mox uh into
2:20
the screens of our Nex.js application.
2:26
So what this is going to do, I'm going
2:27
to run this right now. This is going to
2:30
set up a Nex.js uh like right now there
2:33
is no nex.js files in here. So this is
2:36
going to add all the files to officially
2:38
turn this into a Nex.js JS application.
2:41
Uh it as we go here, we're basically
2:44
going to launch the Nex.js app server.
2:46
Uh and we're going to get to preview all
2:48
the screens.
2:50
And uh
2:52
oh, and I'm going to just tell it uh oh,
2:55
and please
2:58
populate
3:00
with hardcoded
3:02
dummy data.
3:05
And the reason we're doing that is we
3:07
want to see what it's actually going to
3:08
look like. what does this app look like?
3:10
Uh it's not backed by a database yet,
3:12
but we're going to see all the screens
3:13
of the application with filled in with
3:15
dummy data. And this is going to allow
3:17
us to get that real clarity on ensuring
3:19
that it works just the same way we're
3:22
remember we've got these mocks that we
3:23
made uh using that frame zero tool. And
3:27
so we want to see basically all these
3:29
screens. Now is when we convert these
3:30
into actual application code.
3:34
Okay. So it's going to basically run
3:37
let's and again always upfront you end
3:40
up having to uh authorize give it
3:42
permissions and if you choose option
3:44
number two it means you don't have to do
3:46
it every time. So you just have to
3:48
authorize each command once and then
3:50
after that it runs uh on its own.
3:54
So yeah. So here you can see it's made
3:56
its own little to-do list
3:59
and it's going to set up the next.js
4:01
server.
4:03
it knows to install this. Shad CNN UI is
4:06
a uh it's like a framework for doing UX
4:10
components. It's like modular components
4:13
uh for the front end.
4:16
And yeah, you can see exactly what it's
4:18
going to do here. So, I don't need to
4:21
intervene. I'm just going to let this
4:22
run on fast forward and you can see what
4:24
it's doing in the background. Uh but
4:26
basically it's going to it's going to
4:28
launch the the app server, set that all
4:30
up for us, and then uh begin to build
4:33
the screens of the application. So let's
4:35
let's fast forward it and let it run for
4:37
a bit.
4:50
Okay, so it's finished creating the
4:52
screens now and we just need to uh we
4:55
just ran npm install. Um and then now
4:57
we're going to run the build.
5:00
So again, option two that authorizes it
5:03
so we don't have to give it permission
5:04
again.
5:14
And by the way, why it's doing this, uh,
5:16
we had kind of a nice little milestone,
5:19
uh, last week. On Thursday, we had our
5:22
first graduating class of the Build
5:26
School program. And so, uh, if you're
5:28
watching this video, you may already be
5:30
enrolled in Build School, but you don't
5:31
have to. The video is standalone. Uh, so
5:34
this course now you can take on your own
5:36
without actually going through Build
5:38
School. You can just follow along and
5:40
uh, build on your own. or if you want uh
5:43
the you know the companionship and the
5:46
accountability and all that of having a
5:48
cohort approach then you can go through
5:50
this and so yeah we graduated our first
5:52
class this is the the event uh if you
5:56
scroll to the bottom you can find all
5:57
the demo videos uh if you're interested
5:59
to see what uh what app each of those
6:02
five people built. It's pretty cool.
6:03
They did a really good job. Uh could not
6:05
be happier with the first group that we
6:07
had and our applications are now open
6:09
for the next cohort. So, uh, if you're
6:12
considering joining that, you don't
6:13
actually need to be in Lisbon. You can
6:14
join from anywhere. It's just we do have
6:16
a Friday co-work inerson component to it
6:19
that we do in Lisbon. Okay. So, back to
6:22
this. It's finished what it was doing
6:24
here. Let's read what it said. Build
6:26
succeeded. Blah blah blah. Screens
6:29
implemented. So, it's done all this
6:32
dummy data.
6:34
And now this tells us how to run the
6:36
app. So, so it's built the screens. And
6:39
unlike static HTML files, because this
6:42
is delivered via Nex.js, it's running on
6:45
we need to run the app server. So this
6:48
is what we do. We basically grab this
6:50
command
6:52
and we could just tell it, you know, we
6:53
could say, "Hey Claude, please launch
6:55
the app on our behalf." But there's I'll
6:57
show you why it's valuable to run it on
6:59
your own. So copy those commands and
7:02
then just do it here.
7:06
And this is what it looks like when it
7:07
starts up Next.js. You can see it'll
7:09
tell you what port it's running on. On a
7:12
Mac, if you do commandclick, that will
7:14
then open
7:16
that in a browser. I'll just grab this
7:19
and paste it in Brave.
7:26
Okay, here's our app. I don't know if
7:27
you can see with the background. It's
7:29
pretty close. Let me see if I can turn
7:32
off
7:34
Flux.
7:36
I don't know if that's any better. Um,
7:38
so yeah, so you can see the white and
7:40
the beige background. It's basically
7:42
emulating a phone uh aspect ratio here,
7:46
but it's giving us the screens of our
7:48
application.
7:50
It's nice that it's linked it all
7:51
together. Uh, let's see if it has it
7:54
does not yet have the swipe
7:55
functionality. U, but it's like the the
7:58
ability to drag and slide to the left,
8:00
slide to the right. Uh, but it does it
8:02
looks like have
8:07
this interesting. It swipes in rather
8:10
than swipe out. Kind of funny. But yeah,
8:12
but it's populated it with some dummy
8:14
data here. Let's see if these work.
8:17
Great. It's got appointments.
8:20
It's got our liked list
8:22
and it's got our messages. So, this
8:24
looks amazing. I mean, it looks really
8:25
nice
8:27
and it's all linked up. It's what we
8:29
want.
8:31
uh this screen. It looks like there's
8:33
nothing for the profile, but that's
8:34
okay. Um so overall, we should be pretty
8:37
happy. This is our application stubbed
8:39
out. Uh you can see in a matter of
8:41
minutes, however long that took us, uh
8:43
it now gives us something that we can
8:44
actually go and show this to people.
8:46
Now, it's not deployed on the internet
8:48
yet. This is running on our local
8:50
laptop. That's what localhost is here.
8:52
It's our local domain. Um, so we can't
8:55
actually like just send this link out to
8:57
email and show people, but we we have it
8:59
on our laptop, so we can at least show
9:01
it to people in person, get some
9:02
feedback, and confirm that this is
9:04
actually what the app needs to do. Um,
9:08
so yeah, so I think that's probably a
9:10
good place to end this clip. And let me
9:14
just confirm.
9:17
Yeah, bet all the screens for
9:18
completeness. We noticed there was uh
9:20
well, let's just tell it like we're
9:21
missing
9:23
um we'll say uh
9:28
can you check the profile screen? It
9:31
doesn't look like there's any uh any UI
9:34
on that screen.
9:49
So you're right, the profile screen is
9:50
missing. Let me create it. So you know,
9:52
even claude is not perfect. It makes
9:54
mistakes. That's why we check
9:56
everything.
10:06
Okay, it's finished. Let's go check it.
10:12
Cool. And that works. And if you
10:14
noticed, I didn't hit reload. It just
10:16
works, right? This is a kind of a nice
10:18
benefit of working with Nex.js is it has
10:20
this concept of I think they call it hot
10:23
swap or hot reload. Um but you don't
10:26
have to like rebuild or refresh or or
10:29
restart the application server. Like the
10:31
changes you make just take effect
10:33
immediately and are visible which is
10:35
really cool for development. Um okay so
10:37
that that screen is there now. I think
10:39
we're pretty happy with the way things
10:41
are. So, I will end this video and I'll
10:44
see you in the next video where we're
10:45
going to then uh now that will be where
10:48
we actually start to build and wire up
10:50
the back end and make it a real
10:52
application.
10:54
And actually, before we do that, let's
10:55
just fix that little glitch with the
10:57
animation. I I would It kind of bugs me
10:59
that the swiping is backwards. So, let's
11:02
just tell it uh
11:06
when you swipe uh or when you like or
11:09
dislike a dog. Right now, the swipe
11:11
animation is swiping inward. Can you
11:13
change the direction of the swipe so it
11:15
swipes outward on uh both the like and
11:17
dislike?
11:24
Yeah, cuz that's going to annoy me if it
11:26
does this the whole time.
11:29
So, let's see
11:33
if it gets it.
11:43
Okay. Says it's got it. Let's see. Let's
11:46
try it. Let's not reload and see if it
11:48
Yep.
11:50
Now it's got it.
11:52
Cool. All right. So, that's fixed. So,
11:54
let's go ahead and commit this to source
11:56
control because we're happy with the
11:57
work. Uh oh, and this is a good teaching
12:00
moment. So, you can see it says there's
12:02
too many changes. Uh blah blah blah
12:04
first 10,000. So when we set up the
12:07
nextjs app server, it's got all these
12:11
files, all these package files in here,
12:14
you can see app.next. Everything in this
12:17
next folder is a derived. It's like a
12:20
generated file. We don't need it in our
12:21
source control. And so what we need to
12:24
do, the easiest thing is just to say,
12:27
uh, we have over 10,000 files right now
12:30
that are staged for check-in. Can you
12:33
update our git ignore and uh exclude all
12:37
the derived files so we don't get any of
12:39
the Nex.js files in there.
12:47
And so what it'll do, you'll see this
12:49
number drop from 10,000 to like I don't
12:51
know 50 or something. Um but this is a
12:55
common thing. And so so the the the
12:58
takeaway here is that there's this file
12:59
called.getit get ignore in the root and
13:02
the function that serves is to exclude
13:05
files in our project from being tracked
13:08
in source control and so uh so it's
13:11
actually making those updates and it can
13:12
exclude by directory as well as
13:15
individual files so it's it's you can
13:17
see it's like exempting the next
13:20
directory and the build and dist and all
13:22
these other things
13:25
okay so if we go back to this it should
13:31
not sure why that's not updating
13:37
uh
13:39
in track files two entries
13:43
modules indexed. Okay, here we go. I
13:46
don't know funkiness uh maybe caching in
13:49
cursor but you can see it went down to
13:50
29 files from 10,000. So so this is
13:54
good. This is what we want. So let's
13:55
stage the changes here. hit this little
13:58
button to generate the commit message
14:03
and then we're going to commit these to
14:05
our first to our local and then now
14:06
we're going to push those into GitHub.
14:11
Okay, so done with that section. I will
14:13
see you in the next video where we will
14:15
then uh now we'll you know take the
14:17
gloves off and dig in here. And this is
14:19
where it gets fun.


Claude Code 101: 6 Authentication


Transcript











0:00
Okay, so now we're really getting into
0:02
the meat of it. We've just done this. We
0:04
built out our our screens with all the
0:06
mock data, and now we're on to the part
0:09
where it's time to start digging in and
0:10
actually building stuff. So, the way
0:13
we're going to do this, let's first take
0:15
a look. Let's go back to our
0:17
confabulator
0:20
and then let's open the project board.
0:23
So, this shows all of our issues in
0:27
GitHub. Um, so what we're going to do,
0:30
and I like to just, you know, look, kind
0:32
of spot check them, see what's there,
0:34
what needs to be done,
0:42
get an idea just roughly what's there.
0:45
Technical foundation. So, this actually
0:47
sounds like it would be something that
0:49
would occur earlier.
0:51
The rest of this stuff,
0:54
user interaction is probably early.
0:57
Uh, okay. So, just kind of take stock of
0:59
what's there, but we're It doesn't
1:00
matter. We're going to ask Claude. We're
1:02
going to say,
1:05
"Can you use GitHub CLI to go through
1:08
all the open issues on this project and
1:10
determine which one uh we should work on
1:13
next and make a plan for that issue."
1:19
Okay. And I'm going to put it in plan
1:20
mode. Remember, plan mode is the one
1:22
where it's strategic. It's not going to
1:24
do anything. It's actually going to
1:26
think deeply on this stuff and formulate
1:27
a plan. So, this is what we want it to
1:29
do. Um, and yeah, let's turn it loose.
1:33
And it should use the dependency graph
1:36
to check. Remember, this file shows us
1:39
what depends on what. So, it should uh
1:43
if not getting it from the dependencies
1:46
as they're marked out in the issue
1:48
themselves because it says dependencies
1:51
here what it depends on. So see how this
1:53
one this depends on technical
1:55
foundation. So I imagine almost
1:57
everything is going to depend on that.
1:59
So it'll likely do that first. But let's
2:01
see what it does.
2:08
Okay. So you see how it it found that
2:11
all the screens are there but the
2:12
missing piece is that issue 11 the
2:14
technical foundation. So let's see. This
2:18
is going to ask us some clarifying
2:19
questions. logical ext.
2:36
Yeah. So, let's do
2:40
Okay. So, this is interesting. So, I'm
2:42
going to actually change something here.
2:45
I want to do it rather than use postgrql
2:48
for this. Uh I want to use SQLite and
2:53
I'll explain why. Uh basically Postgress
2:56
requires that we have a server running
2:58
to use it whereas SQLite is a filebased
3:01
database. And so I'm actually going to
3:03
I'm going to here I'm going to going to
3:06
interrupt it and say
3:10
can you update the implement
3:12
implementation plan MD file and change
3:17
our approach with the database. I don't
3:18
want to use Postgress. I want to use
3:20
SQLite as the database. Uh and
3:23
eventually we're going to use Terso as
3:25
the production database. But can you
3:26
update the implementation plan first and
3:29
then uh apply any changes necessary to
3:33
GitHub issue number 11 for the technical
3:36
foundation and then redo this plan with
3:39
that in mind.
3:44
So I'm making kind of a game time
3:46
decision just for the purposes of this
3:48
demo of how I want to show it to you
3:50
because rather than waste time setting
3:53
up servers and showing that I would
3:55
rather that we focus on using cloud code
3:57
to build stuff for the purposes of this
3:59
demo and then in some future video we
4:01
can make it use Postgress or Superbase
4:04
or one of these other databases like
4:06
that.
4:11
Okay. So, we'll fast forward this while
4:12
it's doing its thing.
4:18
Um, and I am going to have it do
4:19
Drizzle. So, this Drizzle and Prisma are
4:23
basically two OM technologies. Drizzle,
4:26
I think, at this point is the more
4:27
accepted one. So, we're going to use
4:28
that.
4:34
Okay, let's just quickly review the plan
4:36
that it came up with here. And this is
4:39
why by the way we do have it do a plan
4:41
before diving into implementation
4:43
because we can catch little things like
4:45
that.
4:46
Okay. So drizzle
4:52
good.
5:00
So it's changing references all
5:02
throughout to make sure that
5:03
everything's consistent which is good.
5:25
I'm also going to have it take out
5:26
Google OOTH because that's just more
5:28
complexity than we need for the purposes
5:30
of this demo video.
5:34
So, I'm going to just give it one more
5:36
clarification.
5:38
This plan looks really great, but can
5:39
you also strip out the Google Oath? Uh,
5:42
that's more complex than we need to go
5:44
for the purpose of the MVP. So, pull
5:46
that out of all uh documentation and
5:49
redo the plan with that in mind.
6:01
Okay.
6:03
So I think this is finally it. This is
6:06
what we want.
6:08
So let's say go ahead and approve it.
6:10
Auto accept edits.
6:17
And so it's off to the races now. It's
6:18
just going to start doing stuff. We may
6:20
have to approve a few things, but I'm
6:22
going to let this run and um and
6:26
hopefully we have our basic foundation
6:29
once this is done. Uh, now what I like
6:31
to do when it's working on stuff,
6:34
so this is in progress. So I'll drag
6:37
this here so I know what it's actively
6:39
working on right now. Um, and you can
6:41
also instruct it to just say, "Hey, move
6:43
the issue that you're working on in
6:45
status, like update the status of that
6:47
issue to in progress." But I'll just
6:49
move it there for now.
7:01
Okay, looks like it's finished. Let's
7:02
just check what it says.
7:08
Set up the database. Set up the OM
7:14
authentication.
7:18
Okay. And it gave us test account. So,
7:19
we can actually test this now. So,
7:24
let me just try this. Um, is let's see
7:27
if it's running. Let's restart it.
7:31
So, remember npm rundev is kind of the
7:34
magic thing to do to start the server.
7:37
And then we'll go now to
7:41
put that in a browser.
7:53
Okay. So, and let's grab that password.
7:57
Alex alex atample.com. I'll just copy
8:00
the password here.
8:17
Okay. So, that logged us in.
8:20
And let's now let's test it with the
8:22
shelter admin password here. It looks
8:24
like it created two
8:29
adminapp.com.
8:38
Oh, we got to log out. Oh, but there's
8:40
no So, log out actually isn't created
8:42
yet. So, let's just do this with a new
8:45
a new incognito window. same same way to
8:48
accomplish the same thing.
8:53
Let's read that.
8:56
Uh it was what? Admin at happy pause.
8:59
Well, let's do it with some garbage
9:00
first just to see what it says. Okay,
9:04
good. So, that shouldn't work. Now,
9:07
let's do happy.com
9:10
and the password.
9:13
Oops. admin.
9:18
Okay, so authentication works. So that's
9:20
good news. Um I think that's good for
9:23
this video. That means that this one
9:27
is now done. So we'll move that over
9:29
here. Market is done
9:32
and uh we'll go on to the next one in
9:34
the next video. Actually, first I want
9:36
us to get in the habit of committing the
9:38
the changes. So let's go here, stage our
9:41
changes.
9:43
uh have it generate
9:46
a commit message and there's a special
9:48
convention that you can use. So this was
9:51
issue number 11. So what we say here is
9:54
we say fixes
9:57
number 11 and uh that actually closes
10:01
out the ticket. I've already moved it to
10:02
the done status but this would
10:04
accomplish the same thing of closing out
10:05
the ticket. So let's see stage all these
10:11
and commit.
10:14
Cool. All right. See you in the next
10:16
video.


Claude Code 101: 7 Switch from dummy data to a database


Transcript











0:00
Okay, let's see what's up next. Uh, but
0:02
first, let's clear the context.
0:04
Remember, we want to always free up
0:06
context when we start a new feature. And
0:08
we're just going to say, uh, taking into
0:12
account
0:14
the, uh, implementation plan,
0:19
please review the open GitHub issues and
0:25
make a plan for what's next.
0:30
And again, let's put it in plan mode.
0:33
Let it do its thing.
0:39
All right. And we're going to do UI
0:41
stuff. Remember, we're always design
0:42
first. So, we're going to do a U
0:44
prioritize the UI over everything before
0:47
wiring up the database.
0:54
All right, let's just review what it
0:55
came back with here.
1:13
Okay, so it's starting to write the back
1:15
end, the API routes,
1:18
and then some UI stuff with the swipe
1:24
favorites page.
1:26
And it's starting to replace dummy data
1:30
it looks like with uh live data.
1:34
So yeah. So this looks good. Let's go
1:36
ahead.
1:46
Okay. Here you see it finished. Let's
1:48
see.
1:58
GitHub issues.
2:03
Okay. So, let's
2:06
So, it's running. So, let's go test it.
2:14
And something's not working. So, first
2:17
thing we usually want to do is stop. So,
2:21
C to stop it. And then just npm rundev.
2:25
See if that resolves it.
2:42
So I think what it's done is it's tried
2:44
to swap out the dummy data, but I don't
2:47
know that it the database is working
2:49
yet. So, let's just tell it uh
2:54
and this is just part for the course.
2:55
This is what you do is you work through
2:56
little hiccups like this. So, so on page
3:01
swipe,
3:04
it's not returning
3:07
any dogs. It just says
3:12
can you fix?
3:18
So, I don't think it's populated the
3:20
database yet. Uh, it's like there's a
3:23
limbo zone here where it's tried to set
3:25
make it dynamic, but it hasn't actually
3:27
added any data yet. I think that's
3:28
what's happening.
3:36
Okay. So, here what it's doing, this is
3:38
worth noting. So, I have another MCP
3:41
server called Context 7 installed. Uh,
3:44
you're going to want to install this,
3:45
too. I'll show you how to do it, but
3:46
basically what this does is uh it's it's
3:49
a single MCP server that it can use to
3:51
search for any documentation and it gets
3:54
the the the most current form of any
3:56
documentation for anything we're using.
3:58
It could be a language, a library, a
4:00
database, like third party API
4:04
integration stuff. Uh context 7 is
4:06
really great. It's and it returns the
4:08
docs in an LLM friendly way. Uh, so it's
4:12
just very easy to just say use Context 7
4:15
get the latest docs on whatever is
4:16
causing the problem.
4:20
Um, while it's doing that, I'll just
4:21
show you where you set this up. And I'll
4:24
include the little uh, Java snippet. So,
4:27
it's here
4:29
in the same place where we installed the
4:31
frame zero MCP. Remember, it's towards
4:33
the end of this file. Um, and here you
4:36
can see this is it context 7.
4:39
So, I will put this
4:42
in uh Oops. I'll put this in a text
4:47
file.
4:49
I'll just remember I'll leave it here.
4:50
I'll remember to put that in um so you
4:53
guys have it.
5:00
Oh, and while we're in this file, let's
5:02
just actually grab both of these because
5:04
you're going to want
5:06
you're going to want this Chrome Dev
5:08
Tools, too. I'll show you why in a
5:09
minute. Uh, this is what we use to
5:11
automate our testing so it can actually
5:13
impersonate us and do stuff in the
5:15
browser. And it's really useful. Like
5:17
the idea is always how do we make Claude
5:19
more autonomous and give it more like
5:22
let us not be the bottleneck for
5:24
debugging things. You'll see sometimes
5:26
if you don't have this installed, it'll
5:27
say, "Okay, it's ready for testing. type
5:29
this and tell me what you see in the
5:31
server logs. Like that's just like why
5:34
make us the middleman, right? So Chrome
5:36
DevTools just means you can say you can
5:39
push back on it and say no Claude, you
5:40
test it and tell me what you see. Um so
5:43
yeah, so it's really great. So I'll put
5:44
both of these in that text file here so
5:47
you have them
5:51
and Right. Okay, looks like it's done.
5:54
Let's see what it says here.
5:58
log in Alex example.
6:04
Okay, so let's see.
6:08
Oh, this usually means the server
6:11
stopped. Yep.
6:15
Also, little uh Linux tidbit here. If
6:18
you push the up arrow, it will run or
6:21
you can just keep pushing it and it'll
6:22
look go through cycle through the
6:24
different commands that you've run
6:25
previously. So you don't have to
6:26
actually type things all over again. So
6:28
let's start the server again.
6:32
Reload this page.
6:47
Okay, it still seems to be stuck on
6:49
this. So I'm going to ask it.
6:55
It still seems to be stuck spinning
7:00
on swipe
7:04
saying finding dogs near you.
7:13
And it might be that we actually haven't
7:15
logged in. Let's just make sure.
7:18
Let's do it in an incognito because it
7:20
doesn't have the log out functionality
7:22
yet. So, let's go. Localhost 3000
7:27
login Alexample.com
7:32
password one two three.
7:37
Okay. All right. So, that's what it is.
7:40
Um, this is kind of a weird thing that
7:42
we can't log out here because
7:46
uh this logout functionality just isn't
7:48
built yet. And so I'm doing it in this
7:51
private window which I could also just
7:53
clear cookies in this window and it
7:54
would do the same thing. Uh but so now
7:56
it is working. So
7:59
uh
8:05
so it is working
8:08
um API.
8:11
So okay I'm just going to tell it no it
8:14
actually
8:16
is working. Uh it's there's just
8:21
no ability to log out right now and log
8:26
back in to test. Can you complete the
8:31
logout functionality
8:36
next?
8:52
And while it's doing that, so this is
8:54
something you should get. It's a visual
8:57
way to browse your database.
9:00
And so it should have,
9:03
let's see if it has the database in
9:05
here.
9:10
Local DB. So this is the database. You
9:12
can't open it in cursor. It's a binary
9:15
file. Um
9:17
or it's a is it binary? It might be a
9:19
text file, but you can't open it in
9:21
cursor. But you can open it with this.
9:23
So this is called
9:26
uh DB browser for SQL light. You can get
9:28
it
9:30
browser for SQL light.
9:36
Yeah. So I'll include a link to it. I'll
9:40
put that in that text file as well.
9:43
Um so download this and then this way
9:45
you it's really neat. You can basically
9:47
inspect the database. So we can go here
9:50
and we can say open database. Let's find
9:52
our file here. It'll be under app local
9:57
DB. And let's open that. And then this
10:00
shows us all the different tables that
10:02
are in the database. And we can go in
10:04
here and we can actually browse the
10:06
data. So if I want to say like where are
10:10
dogs? So these are the actual dogs that
10:12
it's pulling
10:16
right now.
10:19
So So yeah.
10:22
See if we find
10:26
Oops.
10:29
Yeah, this happens when the server
10:30
restarts.
10:45
So, Max
10:48
Max is the first one. And I'm guessing
10:51
if we go through this,
10:53
Bella will be the next one.
10:57
Yeah. And there's Bella. So, this is the
10:59
database now that underpins our
11:01
application, right? So, it's no longer
11:03
using dummy data. It's actually pulling
11:04
these dogs out of this SQLite database.
11:08
And uh you can change data in here. If
11:11
we wanted to change Max's name and call
11:13
him, I don't know, uh Fred
11:23
and we got to change his description to
11:26
Fred.
11:28
Apply. And then you actually have to do
11:30
write changes for this to actually
11:31
commit those changes in the database.
11:33
But now if we reload this, you can see
11:37
it says Fred. So this is dynamic data
11:40
being pulled out of the database now,
11:41
which is cool. This is what we want. Um,
11:44
let's see where it is here. Build
11:46
succeeds.
11:50
So log out should now work. So let's
11:52
just test that real quick.
11:58
Okay, cool. So now this has kicked us
11:59
out as it should. If we go to swipe,
12:01
it's probably going to make us Yeah, it
12:03
pushes us back to log in. So,
12:07
example.com
12:08
password 1 2 3
12:12
and that logs us in. Cool. All right.
12:14
So, I think that's good for this video.
12:16
Uh, we will Let's see which ones did we
12:19
just solve? I'm going to say um
12:23
can you update the status of the GitHub
12:25
issues that are now resolved with this
12:28
latest stint of work and commit the
12:30
changes to source control.
12:36
All right. And let's just verify. So it
12:38
should have closed one, two, and three.
12:41
So let's check those issues and see if
12:42
they're still open. And there you can
12:45
see one, two, and three are now in the
12:46
done status. So, that's probably the
12:48
easiest way to to mark stuff off is just
12:50
actually have Claude do it for you. Um,
12:52
likewise, you'll see that there are
12:54
nothing to commit here because it's
12:55
already committed our changes. So, this
12:59
uh this commit which should match this
13:03
number here
13:05
to E59,
13:07
you see down there at the bottom,
13:10
that number matches that number. So, the
13:12
commits there and it's all in source
13:14
control. All right, so I'll see you in
13:16
the next video.

Transcripts Vibecodelisboa 

Claude Code 101: Admin Dashboard and Image Uploads


Transcript











0:00
Okay, so three down and it looks like
0:04
six to go. So let's do this. So uh again
0:11
I'm going to sound like a broken record
0:12
here but clear context and say uh per
0:16
the implementation plan please check the
0:21
remaining
0:22
open GitHub issues and formulate a plan
0:27
for whichever
0:31
we should work on next.
0:35
Throw it in plan mode. Shift tab.
0:38
Let it do its thing.
1:13
What the
1:24
heat?
2:29
Okay. What's it telling us here?
2:36
Okay. Open issues
2:43
and see it referenced the dependency
2:45
graph which is great. So it means it
2:47
knows number nine is the next logical
2:50
and it can tell the dependencies here.
2:55
Okay. So we'll take its recommendation.
2:56
It's got some clarif clarifying
2:58
questions here based on dependency graph
3:00
blah blah blah blocks. Would you like to
3:02
proceed with this? Yeah, let's just go
3:04
with what it's telling us there.
3:15
And this is the backend code. So this is
3:17
for the people managing the dog
3:18
shelters.
3:32
Okay. So for this clarifying question,
3:33
it's asking us uh what we want to use
3:35
for our image uploads. Uh I'm going to
3:37
say Versell blob uh because we are going
3:39
to be deploying this on Versell. So, I'd
3:41
rather not incorporate a whole different
3:43
provider like Cloudflare for this. So,
3:46
uh it's pretty easy to set up. I'll just
3:47
say uh number three for that one.
4:32
Okay, let's review what it's got for us.
4:36
This is pretty
4:39
involved. I'm not going to read
4:40
everything here.
4:43
So, this is the this is basically the
4:45
dashboard for admins
4:47
that it's implementing.
4:49
And what I'm actually looking for right
4:51
now because we switched from Prisma to
4:54
Drizzle and from Postgress to SQLite,
4:57
I'm just looking for any references to
4:59
those outdated um because it's it may be
5:02
that it missed a spot. So, I don't see
5:04
anything.
5:17
Yeah, this all seems straightforward.
5:25
Some UI components to install.
5:30
Great. Let's just let it turn it loose.
5:37
Now, important to note, I've already
5:39
installed Versell CLI. You'll need to do
5:42
that. You can just say, "Claude, please
5:43
install Versell CLI." Uh, so I already
5:46
have Versell running. This is what I
5:48
use. Oops. This is what I use to host uh
5:51
a couple different projects here. It's
5:53
what I use to host the VIC code site
5:55
itself. So, this is already I've already
5:57
set up my Versell account. I've
5:59
installed Versel CLI and I've
6:01
authenticated to it. The first time you
6:03
launch it here, it'll basically open a
6:05
window from the terminal and it'll make
6:07
sure you're logged in and if you are,
6:09
then it completes the handshake and it
6:11
authenticates you. So, uh, so that
6:15
happened already. You'll need to do that
6:17
step. Uh, so I'm not able to show you
6:19
that step. Um, but yeah, if if you're
6:22
wondering how it's doing this stuff
6:23
right now in Versell without us having
6:26
authenticated, it's because I already
6:27
did it before this video.
6:46
Okay, now it just crashed. So, you know,
6:49
remember what I said about the control O
6:51
to prevent it from the rendering from
6:53
freaking out. So, it just freaked out.
6:56
Um, it was almost done. Let's see if we
6:58
can revive it.
7:01
I'll show you how to restore in a a
7:04
previous session.
7:06
But yeah, that that that glitch that I
7:08
mentioned happened just then because I
7:10
stupidly was letting it freak out and
7:12
not keeping it pegged to the control O
7:14
screen. So, let's go resume. This is how
7:17
you get back to where it was.
7:21
And you can see it died here midstream.
7:24
But what you do in this case when it
7:26
crashes is you just say please continue.
7:29
It has all the context so it knows what
7:31
it was doing.
7:38
Okay. So it's finished here. Let's quick
7:40
review what it did. Uh Epic 9. So the
7:45
the screen for admins basically is now
7:48
done.
7:52
It's set uploads
7:55
to use that blob storage on Versell,
7:59
created some new pages, some new API
8:01
endpoints,
8:02
some UI components, and we can test it.
8:06
So let's go ahead and
8:09
uh let's test it with the admin because
8:11
that's what it worked on. So, it's
8:13
admin@appypause.com.
8:15
Um, let's start the server first. So,
8:17
let's go here to npm rundev.
8:21
Oh, and we got to cd into app because
8:23
that's where it lives. npm rundev
8:30
and localhost 3000.
8:38
And we probably need to log out because
8:40
I think we're logged in. Is that Alex
8:42
the user?
8:47
Let's see.
8:52
Yeah. So, we need to log out first and
8:54
then it's adminapp.com.
9:04
Okay. Sarah Smith is the admin user.
9:07
Let's go to the shelter dashboard. This
9:09
is what it should have just done.
9:11
And let's see what it looks like here.
9:13
So, view all.
9:19
Cool. So,
9:21
I'm just going to
9:26
find a picture of a random dog.
9:29
Golden retriever.
9:38
Let's just grab that photo and let's try
9:41
to upload it.
9:43
See if it works.
9:45
I realize that's probably not a golden
9:47
retriever, but something close. Failed
9:49
to upload image. So, let's see what it
9:51
did. Well, so here's a good opportunity
9:53
to show you. So, this remember way back
9:56
when I said uh I prefer rather than
9:58
having Claude do it that we can start
10:00
the server ourselves. It's because we
10:02
get to see the logs here accumulating.
10:05
And so this is the exact error log. So
10:07
if I grab this,
10:10
copy that and then say
10:14
um
10:15
I was testing the uh admin shelter
10:18
dashboard and tried to upload a photo of
10:21
a dog, but it got this error. Can you
10:23
take a look at it?
10:29
And then just Oops. Actually go delete
10:32
that and then copy this again.
10:36
Paste it.
10:39
Oh,
10:42
see
10:44
all the error part. Copy.
10:49
Paste. There it is.
10:54
So, something's messed up on uploads,
10:56
but let's see what else we can test
10:58
here. If we change the name of the dog,
11:05
maybe
11:07
say it's five years old.
11:11
Save changes.
11:15
Okay, so at least it is saving changes.
11:18
We renamed it to Fred, so that works.
11:21
Uh, we can try adding a new dog while
11:24
it's working there. How about um let's
11:28
call it uh what's it corgi?
11:36
Okay.
11:37
So, we'll just grab I guess this guy
11:43
and we'll call him
11:49
uh
11:51
Corky.
11:53
Corgi.
11:57
How do you spell corgi? C O R G I. Yeah.
12:02
Age two male small.
12:07
Corky
12:09
is a cute corgi puppy. Yeah. Blah blah
12:13
blah blah blah. Okay. Um, so
12:19
let's see if they've if it's fixed.
12:23
Ah, so it needs to have versel blob
12:26
store. Okay, so let's let it fix this
12:27
first
12:34
and I'm going to say
12:37
uh you have access
12:39
to versel CLI.
12:42
Can you create a new pro uh project for
12:50
this site and add blob storage
12:55
on my behalf?
12:59
So rather than So this is again always
13:01
like see if you can get Claude to do
13:03
more of it for you. Um I've already
13:05
authenticated it so it's it's already
13:07
hooked up to Versell.
13:10
So let's see.
13:24
Okay, so apparently it can't do the blob
13:26
storage programmatically via the CLI. So
13:29
I got to do these steps real quick. So
13:31
let me just do that. Open a window here.
13:34
And I'm going to put this over here so I
13:39
can read it side by side as I go through
13:42
it.
13:44
Okay. So, Versel dashboard
13:50
here
13:55
create database select blob.
14:04
All right, let's try this again. Corky
14:05
the corgi.
14:08
Age two years old. Small
14:12
Corki is a cute
14:15
corgi.
14:19
And let's see if we can add the image at
14:21
this point.
14:23
Max five images allowed. Let's see what
14:26
the error is here.
14:30
Okay, that's interesting.
14:34
desktop.
14:36
Oh, this is an AIF file. So, this is
14:39
like one of these weird Let's grab a
14:41
JPEG here.
14:45
Yeah, that's a JPEG.
14:52
Okay, perfect. Uploads is working. Let's
14:55
see if we can add this dog now.
14:58
Beautiful. Okay. So, dog management is
15:02
working.
15:04
Is there anything else? No pending
15:06
appointments.
15:07
Cool. So, it did the scheduling, too.
15:09
So, yeah. So, the back end here appears
15:11
to be all working. It was just a little
15:13
bit of a a rabbit hole. We had to go
15:15
down there to make the uploads work, but
15:16
that's all fixed now. And, uh, yeah. So,
15:19
I think that probably does it for this
15:21
video. So, here I'm going to show you
15:22
something that I want to do now because
15:24
we still have some contacts left. You'll
15:26
notice it hasn't even autocompacted. So,
15:28
that's great. we were able to get this
15:29
all done without using the autoco
15:31
compact. But when we have context left
15:33
like this at the end, it's useful to
15:36
have it create this scaffolding that it
15:38
can use to not have to go reanalyze the
15:42
entire project next time. So, I'm going
15:44
to create a new folder here. I'm just
15:46
going to call it temp inside of
15:48
confabulator. And I'm going to say, can
15:51
you uh uh Okay. Well, first off, so
15:55
great. Everything is working.
15:58
Can you uh document the uh the remaining
16:06
uh let's see can you write a handoff doc
16:13
doc for the next engineer who will be
16:19
working on issues
16:22
let's check what they were I think it
16:24
was four four six and 10 on GitHub
16:29
issues
16:33
four,
16:35
six, and 10
16:38
and convey anything
16:41
uh critical for coming up to speed
16:46
quickly on this project. Uh so they can
16:51
get started more easily. And the reason
16:54
we do this is, I don't know if you
16:57
noticed, but it used about 50,000 tokens
17:00
to um Oh, and also uh uh update the
17:07
status
17:09
of any GitHub issues that are resolved
17:14
with this last uh stint of work.
17:21
Um, so the reason they do this is
17:23
basically just because I don't know if
17:25
I'm working on the Claude Max program,
17:27
so I actually have quite a bit more uh
17:30
like a higher quota and more tokens that
17:32
I can use. So if you're using the $20 a
17:35
month Claude Pro plan, uh you want to be
17:38
really conservative with your token
17:40
usage. And this is just a way to make it
17:42
so you don't have to spend an exorbitant
17:44
amount each time coming up to speed when
17:46
you clear context and then it has to
17:48
like get its bearings. Um, if it has a
17:52
little handoff dock like this and I
17:54
always write it saying, you know, you're
17:56
writing this for the next person who's
17:57
going to work on this. Tell them
17:58
everything they need to know to come up
18:00
to speed quickly. And that covers, you
18:02
know, it'll write basically like the
18:04
data schema, the API routes, how the
18:07
file systems organized, you know, what
18:09
the conventions are. So, it's a really
18:11
comprehensive doc. And next time when we
18:14
start working on the remaining issues,
18:16
it's just going to read that doc. We're
18:18
not going to have to do anything else in
18:20
terms of looking at the rest of the
18:22
project. It's just going to be able to
18:23
read that doc and start working
18:24
immediately. And that's going to be
18:25
really helpful.
18:30
Okay. So, it's done. It closed out. 9
18:32
and 10. I noticed that it had uh what
18:37
was it? Seven and eight were in the done
18:39
column. I'm not sure why those were
18:41
marked as done, but I just moved them
18:43
back over to to-do. They were not
18:46
closed. They were just sitting in the
18:47
done column for some reason. So, this is
18:49
why we got to kind of, you know, babysit
18:51
this and keep our eyes on it. Uh, and
18:54
notice little anomalies like that. But
18:56
these two I've moved back. So, we now
18:58
have 4 6 7 8. Those are the remaining
19:00
issues for us to work on. Um,
19:04
and let's see, quick start guide. So,
19:06
let's just look at this doc that it
19:08
made. You can just uh commandclick on it
19:10
and it'll open it. And then shift
19:12
commandV again gives you a nice preview
19:14
of it. Um, so here it basically tells
19:16
you how to run the server, status of
19:20
what's been done, remaining open issues,
19:23
things to know, database, blah blah
19:25
blah. So, this is basically like what
19:28
you would want to read if you're an
19:29
engineer coming in to work on this. And
19:31
as you'll see in the next video when we
19:33
get started, I'm just going to point it
19:34
at this doc. I'm not even going to like
19:36
give it the other stuff. I'm just going
19:38
to say go read this doc and then work on
19:40
the remaining few issues. So, we'll do
19:42
that in the next video and I'll see you
19:44
there. And I always forget to do this,
19:45
but let's check in our code that we just
19:47
did to source control. Just get in the
19:50
habit of that. Uh, it closed out issues
19:53
I think we said nine and 10.
19:57
Yeah, shelter dog management and build
19:59
shelter dashboard. So we can say in our
20:02
commit message
20:03
remember this convention fixes
20:06
number nine
20:08
and number 10
20:11
and commit that sync it and we're good.
20:15
All right.

Claude Code 101: 9 Add Appointment Scheduling


Transcript
0:00
All right, the end is in sight here.
0:02
We've got four left here. Uh, these two
0:06
look related. Let's see what this is.
0:10
Simplified approach.
0:13
So, this is kind of all-encompassing.
0:15
And then what is this? It looks like
0:19
so this is part this is like a subtask
0:22
of that epic.
0:25
So, okay. So, I think we need both of
0:27
these. So, let's have it uh address four
0:30
and six next.
0:33
Um, we'll clear context.
0:37
And then let's put this handoff doc
0:39
where it belongs here in the temp
0:41
folder. And now I'm going to
0:45
say uh please read
0:49
that for context
0:52
and then uh work on GitHub
0:58
issues.
1:00
What is it? Four and six.
1:04
Number four and number six.
1:08
Next,
1:10
uh come up with a plan to implement.
1:24
All right, clarifying questions.
1:29
Uh let's defer emails for now.
1:35
We'll include that at the end as a part
1:37
of the probably part of the launch or
1:39
deploy section.
2:01
All right, let's take a look at what it
2:02
says.
2:14
So this is all about booking
2:16
appointments
2:22
wire to the database confirmation page
2:26
list.
2:30
Okay, let's go ahead and start.
2:37
All right, so I finished up. Let's see
2:39
the summary.
2:51
Okay, so we'll let's test it. Uh let's
2:54
go.
2:56
Server is running, so we don't need to
2:58
restart it. So, if we just go to
3:00
localhost 3000, we should be able to get
3:03
to it. And we're testing the appointment
3:06
booking functionality. Maybe we need to
3:08
restart the server.
3:21
Okay.
3:25
And who are we logged in as? Okay, so
3:29
we're logged in as an admin. I wonder if
3:30
we can still do an appointment booking
3:35
appointments. Browse dogs. So, let's
3:38
like a dog,
3:40
then go to our liked dog list.
3:45
And we've got an error. So, let's
3:48
have it debug this error.
3:53
Uh, I'm on
3:57
this page.
4:06
I'm see.
4:13
And I'm getting this
4:17
error.
4:30
So, the dog details page is airing out.
4:33
It looks like
4:51
Okay. So, there's the details page.
4:53
Seems to be working now.
4:56
I guess it's applying this fix to other
4:59
pages that use the same pattern. Uh, so,
5:03
okay. So, we can test this though. So,
5:04
book an appointment. Let's see if this
5:06
works.
5:09
Dog not found. Back to swipe. Let's do
5:12
another one.
5:14
Favorite dogs. Bella. book an
5:17
appointment.
5:19
Okay, I'm just going to go tell it.
5:22
Now, while it's still working, you can
5:24
actually task it with other stuff and
5:26
you can give it clarifying questions.
5:28
Like if you notice something and you
5:29
want to give it some more context while
5:31
it's solving the error, you can just
5:33
talk to it here. So, while it's still
5:35
doing this, I'm going to say, uh, I
5:36
tried
5:38
um booking an appointment
5:42
for the dog named Bella.
5:47
And uh on this page
5:56
it's saying
5:59
dog not found.
6:06
Okay. So, well, let's just see if that
6:08
whatever it was doing fixed it because
6:10
this may be related.
6:18
See if it's running. We need to restart
6:21
the server.
6:23
npm rundev.
6:35
Okay. So, it's still saying dog not
6:37
found. So, let's tell it
6:39
uh can you fix
6:46
Okay.
6:48
Okay. So, there we go. That fixed it.
6:50
Now, we're just booking an appointment,
6:52
let's say, for Thursday at I don't know,
6:55
noon.
6:56
And I'm looking forward to it.
7:02
Confirm appointment.
7:06
Okay. Appointment requested.
7:09
That's good. View my appointments. So,
7:12
it's got a list of my appointments.
7:14
That's cool.
7:16
And I guess what we want to see because
7:18
we are actually the
7:21
we're logged in as the shelter admin. I
7:25
wonder if we can just go and now see
7:30
shelter dashboard. Let's see if the back
7:32
end of this is working. pending
7:34
appointments.
7:36
No pending appointments. Okay, so that's
7:38
a problem. So let's ask it why
7:45
say um
7:48
I was able to book an appointment
7:50
successfully. So that's working now.
7:51
Thank you. Uh but I noticed that when
7:55
I'm logged in as the shelter admin, I'm
7:57
not able to see that appointment in my
8:00
list of upcoming appointments. Can you
8:02
investigate that?
8:07
And I'll give it the page that I Oops.
8:12
See, it takes over the clipboard when I
8:13
do that. So, let me
8:17
grab this page
8:20
and paste it.
8:23
Uh, it happened. I'll say it happened
8:25
here.
8:27
It happens on this page.
8:36
Okay, so that's interesting. So the dogs
8:38
are already it has the notion of
8:40
multiple shelters and so it may be that
8:43
the the dog actually belongs to a
8:44
different shelter and so that could be
8:46
working properly if it if it does that.
8:49
That's pretty cool.
8:51
Let's see it. Uh
8:53
so we know we're logged in as Sarah the
8:57
admin. Which shelter are we?
9:02
Okay. I don't see how it relates it to
9:04
shelter. So, we want to ask it that.
9:09
Okay. Let's see.
9:17
Okay. So, it says these three dogs are
9:20
with that shelter. So, let's go back and
9:22
try it.
9:25
Let's go to swipe
9:28
Rocky. Well, let's just like them all
9:31
here. Luna. Okay, so Luna was one of
9:33
them. So now if we go,
9:37
let's go to our like dogs. Go to Luna.
9:40
Book Luna.
9:44
We'll say Friday at 10:30.
9:48
Yay.
9:52
Okay, back to home.
9:55
Now, let's go to the admin dashboard.
9:58
Okay. And it's got it. So cool. So that
10:00
was an issue of the dogs not being
10:03
related to the right shelter. I would
10:06
like to know how they're related, where
10:09
that happens. I guess let's see.
10:11
Shelters. It probably has it here,
10:15
San Francisco.
10:18
Um, I'll just ask Claude.
10:22
How are dogs related to a shelter? I'm
10:24
not seeing that in the database, but I
10:26
confirm that that did work. Uh, so I
10:29
trust you that it is working, but I just
10:31
want to understand how the dogs are
10:32
actually related to the shelters.
10:44
And this is where I guess it's kind of
10:46
good to point this out, like Claude is
10:49
like the world's greatest teacher in
10:51
this. Like there's no better way to
10:52
learn this stuff than to just talk to it
10:54
and ask it. And Claude has full
10:57
visibility. So it says, "Great question.
10:58
Let me show you the database schema.
11:02
Shelter ID." Okay, so in the dogs table,
11:06
it has a shelter ID.
11:10
Okay, here it is. So that's what relates
11:12
it to the shelters.
11:16
So, so Luna, so this shelter, this 5E7,
11:21
this one, uh, these three dogs. So, that
11:24
is the the shelter for which, uh, let's
11:27
see, 5 E7 happy pause. And so, I'm I'm
11:33
guessing that
11:38
there must be like an admin
11:44
info, happy pause.
11:46
So that's how they're tied though. So
11:48
the dogs have a shelter ID associated
11:51
with them. So cool. So this is all
11:54
working. Um I think we've that closes
11:57
out that those two tasks uh the bookings
12:00
because you can see it from the user
12:02
side and you can see it now from the
12:04
admin side as well. So I think we're
12:06
done with that one. Um and we'll say
12:10
great can you commit this code to source
12:14
control and also close out uh the issues
12:19
uh uh issues number four and number
12:25
six in GitHub. Uh thanks
12:42
You can see I had moved the handoff
12:43
dock. That's why it's it's not picked up
12:46
by those changes. So I'll just
12:49
commit that as well.
12:54
And I think we're good. So that leaves
12:57
us with
12:59
Let's see if it hasn't moved this one.
13:02
Let's move this over there. And it's
13:05
closed. Okay, cool. So, that leaves us
13:07
with just basically the inapp messaging
13:10
is our last task here. So, we'll do that
13:12
in the next video.








