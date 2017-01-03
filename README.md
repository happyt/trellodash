# trellodash

This was created for use by me on projects held in trello.
It was initially used to count the checklist items to be done and give 
a burnup chart of the work in hand. I can see a cards only version by checking 
the 'Cards or Checklist' box, but I haven't made much sense of the output. 
It is running at http://trellodash.herokuapp.com/#/ at the moment. Cards
without a checklist will have a default value assigned, so as to allow some 
estimation to be made of contingency.

Add a project by creating a project on trello; the link to the trello board
will have a board code in the title. Add the board name and this code when adding
to the database; the longer boardId field should be filled in by the system. The 
chart title is used in the display and can be a longer version. Don't change the 
Board Name once the figures have been started.

- Dates are not used at the moment.
- If Enabled is checked, stats will be collected.
- Live checkbox is not used. (?)
- Normally the figures will be kept for the final state each day.
- An Hourly option is for a hackday, to show progress at hourly intervals. 
- To record the current state, http://trellodash.herokuapp.com/trigger
- The trigger function could be driven automatically from a trello board update

IanM 2015

## Development

This is based around angular 1 libraries. A simple app from 
https://devcenter.heroku.com/articles/mean-apps-restful-api

Changed to use Entry rather than Contact

Will be the base of editing a list of Trello boards and their codes

- v1.0 branched to crudbase - uses names and 'entries' db collection
- v2.0 required stats from database coming into the angular stream
    added web page to see data from db

- API for data is http://localhost:8080/counts/Trello%20Stats

Jan 2017
- added request-promise to get boardId when add new board 
- added button on list to go to chart for that Entry
- this link is http://localhost:8080/#/chart/Trello%20Stats   (default was Trello%20Stats)

## Local testing
- need a mongodb database running
- collection used is 'myproject'
- node server will start the server, display port
- no hot reloading, need to save code, stop/restart to test each change 
- dates are unused

## Remote
- just 'git push heroku master' to release new version

## Next ideas...
- add a value for each board to scale contingency
- get version automatically from build
- save tags?
- save people? 
- cards version
- Recent actions list

## Later
- Add score in circle ?
- Amend chart colours
- Azure test