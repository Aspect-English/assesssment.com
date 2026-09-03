"use strict";

/**
 * 上傳錄音到 Supabase Storage
 */
async function uploadRecording(audioBlob, filePath) {

    try {

        console.log("開始上傳錄音：", filePath);

        const { data, error } =
            await supabaseClient
                .storage
                .from("speaking-recordings")
                .upload(
                    filePath,
                    audioBlob,
                    {
                        upsert: true,
                        contentType: audioBlob.type
                    }
                );

        if (error) {
            throw error;
        }

        console.log("錄音上傳成功：", data);

        return data;

    } catch (error) {

        console.error("錄音上傳失敗：", error);

        throw error;

    }

}