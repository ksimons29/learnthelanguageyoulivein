1) Research report: Gamification and games for LLYLI
What is already built and what that implies

Your current MVP is not missing “gamification”. It already has the ingredients that actually matter:

Core loop is implemented: capture, dynamic sentence generation, FSRS review, notebook, progress dashboard. 

CHANGELOG

Review flow is implemented with 3 exercise types and QA coverage confirms it. 

CHANGELOG

Your engineering docs claim MVP is ~85% complete, with remaining P0 mainly PWA and end to end testing. 

CHANGELOG

So the real question is not “add gamification”. The question is “wrap the existing learning engine in a game layer that increases compliance without ruining learning quality”.

The hard truth about SRS products

Compliance is the killer. The research notes explicitly call out severe dropout and cite a study where only 36% continue using assigned SRS tools. 

Research_SRS__Synthesis_Noteboo…

 

Research NotebookLM SRS Notes

So any “competitive” game design for LLYLI must do exactly one thing: make people come back and finish short sessions.

What “gamification that actually works” means for LLYLI

From your research notes synthesis, the engagement levers are very specific:

Novelty via dynamic sentence based repetition
Dynamic single use sentences keep material fresh, and efficiency links to enjoyment (r = 0.5). 

Research_SRS__Synthesis_Noteboo…

 

Research NotebookLM SRS Notes

Content trust via real world retrieval
Users enjoy and trust retrieved corpus sentences (Wikipedia) more than purely generated sentences. 

Research_SRS__Synthesis_Noteboo…

 

Research_SRS__Synthesis_Noteboo…

Interestingness and entertainment value
“Entertainment value” is explicitly mentioned: sentences can form a story or vary complexity to stay interesting. 

Research_SRS__Synthesis_Noteboo…

 

Research NotebookLM SRS Notes

Session flow that creates habit
“Done for today” creates accomplishment, plus optional “Learn new words” for motivated users, plus structured reminders for short daily sessions. 

Research NotebookLM SRS Notes

 

Research_SRS__Synthesis_Noteboo…

Keep tasks short to avoid overload
Ten word rule shows up repeatedly. 

Research_SRS__Synthesis_Noteboo…

 

Research SRS 2024

Mastery and feedback are part of motivation
Three correct recalls improves 1 week retention from 64% to 87%, and immediate corrective feedback gives an 11% retention boost. 

Research NotebookLM SRS Notes

 

Research_SRS__Synthesis_Noteboo…

That list is your real “proven gamification”. Not points. Not leaderboards. Not cartoon currencies.

Competitive interpretation: what LLYLI should copy and what it should refuse

What you should copy (but adapt)

Clear daily goal and a completion ritual
Duolingo nails “I finished”. Your research explicitly supports the Done for today screen as habit formation. 

Research NotebookLM SRS Notes

Short sessions and reminders
Research supports short spaced sessions for better recall and compliance. 

Research_SRS__Synthesis_Noteboo…

A “next thing to do” that is optional
Learn new words after completion is explicitly supported as voluntary progression. 

Research_SRS__Synthesis_Noteboo…

What you should refuse

Grind mechanics that increase volume without learning value
Your own notes warn against massed practice and overly long tasks, and emphasize brevity. 

Research_SRS__Synthesis_Noteboo…

Reward loops that push users into cramming
If your reward is “more tasks”, you are designing against the research constraints.

Games to play inside LLYLI (designed to preserve learning quality)

These are game formats that map directly onto what you already have (dynamic sentences, active recall, immediate feedback, mastery).

Game 1: Story mode review
What it is
Each review sentence is a line in a micro story, same vibe as your notebook identity. You can vary complexity and keep it interesting, which your research explicitly calls out as entertainment value. 

Research NotebookLM SRS Notes

Why it works
It increases curiosity without changing the learning task.

MVP implementation idea
Add a “Story thread” label to a review session and show “Chapter complete” on Done for today.

Game 2: Daily mission
What it is
A single clear mission per day, for example “Complete 8 reviews” or “Master 1 word”. Completion triggers Done for today.

Why it works
It converts an abstract backlog into a finite task, and Done for today is explicitly recommended for habit. 

Research_SRS__Synthesis_Noteboo…

MVP implementation idea
Mission picks based on due count and target 10 to 20 minutes session length. 

Research_SRS__Synthesis_Noteboo…

Game 3: Boss round
What it is
End of session, 60 to 90 seconds rapid recall with the same 3 exercise types you already implemented. 

CHANGELOG

Why it works
It adds intensity and closure but remains retrieval practice with immediate feedback, which the notes tie to better retention. 

Research_SRS__Synthesis_Noteboo…

Game 4: Bingo board for variety
What it is
A 3x3 board where squares are things like “Work word”, “Social word”, “Type translation”, “Under 10 words”, “Perfect boss round”.

Why it works
It nudges breadth and prevents monotony without inflating volume. It aligns with “interestingness” and novelty goals. 

Research NotebookLM SRS Notes

 

Research NotebookLM SRS Notes

Game 5: Collector album tied to mastery
What it is
When a word hits 3 correct recalls in separate sessions, it becomes a “collected” card in a set. 

prd

Why it works
Mastery criteria is proven to matter, so celebrating it is a safe reward. 

Research_SRS__Synthesis_Noteboo…

Game 6: Real life mission
What it is
Pick 1 phrase, prompt user to use it today, then capture a quick “used it” confirmation.

Why it works
It reinforces your main differentiation: vocabulary from your life, not theirs. 

vision

What to measure so you know if this is real or just cute

Use your PRD success metrics structure (session completion, 30 day retention, session duration) and add game layer metrics:

Daily session completion rate (did they hit Done for today)

Return rate day 2, day 7, day 30

Drop off point inside review session

Proportion of users who choose Learn new words after completion (voluntary progression)

Mastery velocity: words reaching 3 correct criterion per week 

prd

Constraints and honesty about unknowns

Your research notes explicitly say there is no evidence for self captured personalized phrases and that conversation transfer remains unproven. 

Research_SRS__Synthesis_Noteboo…

So do not pretend the game layer solves language acquisition. It solves usage and repetition. That is enough for MVP validation.