"use strict";

/**
 * 建立測驗 Session
 */
async function startSession(testData, totalQuestions) {

    const session = await createTestSession(
        testData,
        totalQuestions
    );

    testData.sessionId = session.id;

    console.log(
        "Session 建立完成：",
        session.id
    );

    return session;

}

/**
 * 更新目前做到第幾題
 */
async function updateCurrentQuestion(
    sessionId,
    questionNumber
) {

    const { error } =
        await supabaseClient
            .from("test_sessions")
            .update({

                current_question:
                    questionNumber,

                last_active_at:
                    new Date().toISOString()

            })
            .eq("id", sessionId);

    if (error) {

        console.error(error);

    }

}