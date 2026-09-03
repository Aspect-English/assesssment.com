"use strict";

const ASSESSMENT_SETTINGS = {
  // 測試時設為 true：長時間會縮短成 2–3 秒。
  // 正式使用前改為 false。
  demoMode: true
};

const SPEAKING_QUESTION_FLOW = [
  {
    order: 1,
    code: "SPK-P1-Q1",
    part: 1,
    type: "read_aloud",
    title: "Read a text aloud",
    preparationSeconds: 45,
    responseSeconds: 45,
    preResponseDelaySeconds: 0,
    audioRepeatCount: 0,
    scoreMax: 3,
    promptText:
      "Good morning, everyone. Thank you for visiting our language center. Our staff members are available to answer questions about courses, schedules, and registration."
  },
  {
    order: 2,
    code: "SPK-P1-Q2",
    part: 1,
    type: "read_aloud",
    title: "Read a text aloud",
    preparationSeconds: 45,
    responseSeconds: 45,
    preResponseDelaySeconds: 0,
    audioRepeatCount: 0,
    scoreMax: 3,
    promptText:
      "The city library will host a free workshop this Saturday. Participants will learn how to search online databases and reserve books through the library website."
  },
  {
    order: 3,
    code: "SPK-P2-Q3",
    part: 2,
    type: "describe_picture",
    title: "Describe a picture",
    preparationSeconds: 45,
    responseSeconds: 30,
    preResponseDelaySeconds: 0,
    audioRepeatCount: 0,
    scoreMax: 3,
    promptImagePath: ""
  },
  {
    order: 4,
    code: "SPK-P2-Q4",
    part: 2,
    type: "describe_picture",
    title: "Describe a picture",
    preparationSeconds: 45,
    responseSeconds: 30,
    preResponseDelaySeconds: 0,
    audioRepeatCount: 0,
    scoreMax: 3,
    promptImagePath: ""
  },
  {
    order: 5,
    code: "SPK-P3-Q5",
    part: 3,
    type: "respond_question",
    title: "Respond to questions",
    preparationSeconds: 3,
    responseSeconds: 15,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 1,
    scoreMax: 3,
    promptText: "How often do you use public transportation?"
  },
  {
    order: 6,
    code: "SPK-P3-Q6",
    part: 3,
    type: "respond_question",
    title: "Respond to questions",
    preparationSeconds: 3,
    responseSeconds: 15,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 1,
    scoreMax: 3,
    promptText: "What kind of transportation do you prefer, and why?"
  },
  {
    order: 7,
    code: "SPK-P3-Q7",
    part: 3,
    type: "respond_question",
    title: "Respond to questions",
    preparationSeconds: 3,
    responseSeconds: 30,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 1,
    scoreMax: 3,
    promptText:
      "Describe a time when public transportation helped you save time or money."
  },
  {
    order: 8,
    code: "SPK-P4-Q8",
    part: 4,
    type: "respond_information",
    title: "Respond using information provided",
    preparationSeconds: 45,
    responseSeconds: 15,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 1,
    scoreMax: 3,
    sharedStimulusKey: "P4_SET_A",
    informationText:
      "Community Workshop Schedule\n\n9:00 A.M. — Opening Remarks\n9:30 A.M. — Digital Marketing Basics\n11:00 A.M. — Customer Service Strategies\n1:30 P.M. — Building a Professional Network",
    promptText:
      "What is the first workshop scheduled after the opening remarks?"
  },
  {
    order: 9,
    code: "SPK-P4-Q9",
    part: 4,
    type: "respond_information",
    title: "Respond using information provided",
    preparationSeconds: 0,
    responseSeconds: 15,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 1,
    scoreMax: 3,
    sharedStimulusKey: "P4_SET_A",
    informationText:
      "Community Workshop Schedule\n\n9:00 A.M. — Opening Remarks\n9:30 A.M. — Digital Marketing Basics\n11:00 A.M. — Customer Service Strategies\n1:30 P.M. — Building a Professional Network",
    promptText:
      "At what time does the customer service workshop begin?"
  },
  {
    order: 10,
    code: "SPK-P4-Q10",
    part: 4,
    type: "respond_information",
    title: "Respond using information provided",
    preparationSeconds: 0,
    responseSeconds: 30,
    preResponseDelaySeconds: 3,
    audioRepeatCount: 2,
    scoreMax: 3,
    sharedStimulusKey: "P4_SET_A",
    informationText:
      "Community Workshop Schedule\n\n9:00 A.M. — Opening Remarks\n9:30 A.M. — Digital Marketing Basics\n11:00 A.M. — Customer Service Strategies\n1:30 P.M. — Building a Professional Network",
    promptText:
      "I am interested in networking opportunities. Which session should I attend, and when does it begin?"
  },
  {
    order: 11,
    code: "SPK-P5-Q11",
    part: 5,
    type: "express_opinion",
    title: "Express an opinion",
    preparationSeconds: 45,
    responseSeconds: 60,
    preResponseDelaySeconds: 0,
    audioRepeatCount: 0,
    scoreMax: 5,
    promptText:
      "Do you agree or disagree that employees should be allowed to work from home? Give specific reasons and examples to support your opinion."
  }
];

function getSpeakingQuestions() {
  return SPEAKING_QUESTION_FLOW.map((question) => {
    if (!ASSESSMENT_SETTINGS.demoMode) {
      return { ...question };
    }

    return {
      ...question,
      preparationSeconds:
        Math.min(question.preparationSeconds, 3),
      responseSeconds:
        Math.min(question.responseSeconds, 3),
      preResponseDelaySeconds:
        Math.min(question.preResponseDelaySeconds, 2)
    };
  });
}
