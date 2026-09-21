window.VLD_SITE = {
    name: "[Your preferred name]",
    grade: "[Your grade]",
  
    // The week strip on the home page runs from startDate to endDate.
    // Use a Monday for startDate so each square is one Monday-to-Sunday week.
    startDate: "2026-09-07",
    endDate: "2027-06-11",
  
    // One block per course. If you switch courses, add a new block, change the old
    // one's status to "Switched" and explain why in switchReason.
    courses: [
      {
        name: "[Course name]",
        url: "",                       // link to the course, if it has one
        status: "Current",             // "Current", "Finished" or "Switched"
        reason: "[One honest sentence on why you picked it.]",
        approved: "",                  // date your supervisor teacher approved it, like 2026-09-14
        started: "",                   // like 2026-09-21
        progress: "[Where you are in the course right now.]",
        switchReason: ""               // only if you switched away from it
      }
    ],
  
    // Proof of learning: certificates, screenshots, final projects.
    // Put image files in the img/ folder. Crop out anything personal first.
    evidence: [
      // {
      //   title: "Module 3 quiz result",
      //   date: "2026-10-23",
      //   kind: "Screenshot",
      //   note: "Scored 9 of 10. The one I missed was about ...",
      //   image: "img/module-3-quiz.png",
      //   url: ""
      // }
    ]
  };