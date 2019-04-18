/** This code is included in our WorkflowTaskUpdateAfter event to ensure Tracker can process each card properly.
*/
// Tracker & Walk-Ins
if (appMatch("Permits/Walk-in Record/NA/NA")) {
	if (wfTask == "Reception") {
		if (wfStatus == "Send to Review") { 
			updateReceptionShortnotes();
		}
		if (wfStatus == "Customer Departed") updateShortNotes("departed");
		if (wfStatus == "Activate") {
			// 'supervisor' tasks open from the comments
			var tasks = wfComment.split("Activate ");
			if (tasks.length > 1) {
				tasks = tasks[1].split(",");
			}
			var shortNotes = "" + getShortNotes();
			shortNotes = shortNotes.split("|");
			for (var task in tasks) {
				if (tasks[task].length && !isTaskActive(tasks[task])) { // skip emptys and tasks already active
					activateTask(tasks[task]);
					shortNotes[1] += "," + tasks[task];
				}
			}
			shortNotes[0] = (new Date()).getTime().toString();
			updateShortNotes(shortNotes.join("|"));
		}
	} else if (wfStatus != "Add Time") {
		updateReviewerShortnotes(wfStatus);
	}
}

function updateReceptionShortnotes() { //updates shortnotes field with active WF review tasks
    var shortNotes = "" + getShortNotes();
    var currentDate = (new Date()).getTime();
    var waitReviews = getWalkinReviewsActiveList();
    updateShortNotes(currentDate + "|" + waitReviews + "|"); // pipe delimited
}

function getWalkinReviewsActiveList() { // gets all active tasks not named reception or Time after wf closed (for time tracking)
    var count = 0;
    var tasks = aa.workflow.getTasks(capId);
    var list = [];
    if (tasks.getSuccess()) {
        tasks = tasks.getOutput();
        for (var i in tasks) {
            if (tasks[i].getActiveFlag() == "Y" && tasks[i].getTaskDescription() != "Reception" && tasks[i].getTaskDescription() != "Time After WF Closed") {
                list.push(tasks[i].getTaskDescription()); // add to array
            }
        }
    }
    return list;
}

function updateReviewerShortnotes() { // updates shortnotes based on entry from review task status
	var shortNotes = "" + getShortNotes();
	var snSplit = shortNotes.split("|");
	var snWait = "";
	var snWith = "";
	if (snSplit.length == 3) {
		snWait = snSplit[1];
		snWith = snSplit[2];
	}
	// Set arrays to empty if no values
	if (snWith != "") {
		snWith = snWith.split(",");
	} else {
		snWith = [];
	}
	if (snWait != "") {
		snWait = snWait.split(",");
	} else {
		snWait = [];
	}
	var hasRecep = false;
	// Move task to respective section of shortNotes
	if (wfStatus == "Send to Reception") {
		logDebug("Sending to reception.");
		for (var i in snWith) {
			if (snWith[i] == wfTask) {
				snWith.splice(i, 1);
			}
		}
		for (var l in snWait) {
			if (snWait[l] == 'Reception') {
				hasRecep = true;
			}
		}
		if (!hasRecep && snWait.length == 0 && snWith.length == 0) { //default reception
			snWait.push('Reception');
		}
	} else if (wfStatus == "Customer Arrived") {
		logDebug("Customer has arrived");
		for (var k in snWait) {
			if (snWait[k] == wfTask) { // remove from wait list
				snWait.splice(k, 1);
			}
		}
		snWith.push(wfTask); //add to with list
	} else {
		logDebug("wfStatus is not working");
	}
	// Set arrays back to strings
	snWith = snWith.toString();
	snWait = snWait.toString();
	// grab current time stamp
	var snTime = (new Date()).getTime();
	snTime = snTime.toString();
	// Set the new shortnotes
	var sn = snTime + "|" + snWait + "|" + snWith;
	updateShortNotes(sn);
}
