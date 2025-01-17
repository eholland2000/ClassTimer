// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

module.exports = {
    en: {
        translation: {
            //WELCOME_MSG: 'Testing',
            
            // CHANGED
            WELCOME_MSG: 'Welcome to class time! You can start an activity by saying start followed by the activity name. What would you like to do?',
            MUSIC_MSG: 'If you would like to listen to music during break, say play music.',
            
            // NOT CHANGED
            HELP_MSG: 'I can help you set a timer, check on a running timer, delete a timer or pause and resume timers. Which one would you like to try? ',
            REPROMPT_MSG: `What would you like to do next?`,
            GOODBYE_MSG: ['Goodbye! ', 'So long! ', 'See you later! ', 'Cheers! '],
            REFLECTOR_MSG: 'You just triggered {{intent}}',
            FALLBACK_MSG: `Sorry, I don't know about that. Please try again.`,
            ERROR_MSG: 'Sorry, there was an error. Please try again.',
            PERMISSIONS_CARD_MSG: 'I just sent you a card to the Alexa app to enable permissions for Timers. Please enable it and open the skill again! Bye',
            TIMER_COUNT_MSG: 'You have {{count}} timer. ',
            TIMER_COUNT_MSG_plural: 'You have {{count}} timers. ',
            LAST_TIMER_MSG: 'Your last timer {{status}}. ',
            NO_TIMER_MSG: `You haven't set a timer. Try saying, set a timer. `,
            ANNOUNCEMENT_TIMER_TITLE_MSG: 'My Announcement Timer',
            ANNOUNCEMENT_LOCALE_MSG: 'en-US',
            ANNOUNCEMENT_TEXT_MSG: 'That was your timer!',
            TASK_TIMER_TITLE_MSG: 'My Task Timer',
            TASK_LOCALE_MSG: 'en-US',
            TASK_TEXT_MSG: 'Timer elapsed. Would you like to launch {continueWithSkillName}?',
            
            // CHANGED
            VOICE_PERMISSION_ACCEPTED: 'You can use class time! To start an activity, say start followed by the activity name.',
            
            // NOT CHANGED
            VOICE_PERMISSION_DENIED: 'We can\'t continue if you don\'t allow timers. Please try again later. ',
            VOICE_PERMISSION_ERROR: 'There was an error enabling the permissions. Please try again later. ',
            CREATE_TIMER_OK_MSG: 'Your timer is now running! If you want to check on it just say, check my timer. ',
            CREATE_TIMER_ERROR_MSG: 'Failed to create the timer. Sorry! ',
            READ_TIMER_ERROR_MSG: 'Failed to read the timer status. Sorry! ',
            DELETE_TIMER_OK_MSG: 'Your timer has been deleted! If you want to create another one just say, set a timer of, followed by the duration. ',
            DELETE_TIMER_ERROR_MSG: 'Failed to delete the timer. Sorry! ',
            PAUSE_TIMER_OK_MSG: 'Your timers have been paused! If you want to resume them just say, resume my timers. ',
            PAUSE_TIMER_ERROR_MSG: 'Failed to pause timers. Sorry! ',
            RESUME_TIMER_OK_MSG: 'Your timers have been resumed! If you want to pause them just say, pause my timers. ',
            RESUME_TIMER_ERROR_MSG: 'Failed to resume timers. Sorry! ',
            ON_TIMER_STATUS_MSG: ' is running',
            OFF_TIMER_STATUS_MSG: ' is off',
            PAUSED_TIMER_STATUS_MSG: ' is paused'
        }
    },
    es: {
        translation: {
            WELCOME_MSG: 'Te doy la bienvenida. Puedes crear un temporizador diciendo, pon un temporizador de, seguido de la duración. Qué te gustaría hacer?',
            HELP_MSG: 'Puedo ayudarte a crear un temporizador, consultar un temporizador que esté corriendo, borrar un temporizador o pausar y reanudar temporizadores. Cúal te gustaría probar? ',
            REPROMPT_MSG: `Que otra cosa quieres hacer?`,
            GOODBYE_MSG: ['Hasta luego! ', 'Adios! ', 'Hasta pronto! ', 'Nos vemos! '],
            REFLECTOR_MSG: 'Acabas de activar {{intent}}',
            FALLBACK_MSG: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez. ',
            ERROR_MSG: 'Lo siento, ha habido un problema. Por favor inténtalo otra vez. ',
            PERMISSIONS_CARD_MSG: 'Acabo de enviarte una tarjeta a tu app Alexa para que habilities los permisos de temporizadores. Por favor activa estos permisos y abre la skill otra vez! Adiós',
            TIMER_COUNT_MSG: 'Tienes {{count}} temporizador. ',
            TIMER_COUNT_MSG_plural: 'Tienes {{count}} temporizadores. ',
            LAST_TIMER_MSG: 'Tu último temporizador {{status}}. ',
            NO_TIMER_MSG: `No has configurado un temporizador aun. Intenta decir, crea un temporizador. `,
            ANNOUNCEMENT_TIMER_TITLE_MSG: 'Mi Temporizador de Anuncio',
            ANNOUNCEMENT_LOCALE_MSG: 'es-ES',
            ANNOUNCEMENT_TEXT_MSG: 'Ese fue tu temporizador!',
            TASK_TIMER_TITLE_MSG: 'Mi Temporizador de Tarea',
            TASK_LOCALE_MSG: 'es-ES',
            TASK_TEXT_MSG: 'Temporizador finalizado. Quieres pasar el control a {continueWithSkillName}?',
            VOICE_PERMISSION_ACCEPTED: 'Ahora ya puedes crear un temporizador diciendo, crea un temporizador de, seguido de la duración. ',
            VOICE_PERMISSION_DENIED: 'No podemos continuar si no otorgas permisos para temporizadores. Prueba otra vez más tarde. ',
            VOICE_PERMISSION_ERROR: 'Hubo un error habilitando los permisos. Prueba otra vez más tarde. ',
            CREATE_TIMER_OK_MSG: 'Tu temporizador ya está en marcha! Si quieres ver su estado solo dí, lee mi temporizador. ',
            CREATE_TIMER_ERROR_MSG: 'No he podido crear el temporizador. Perdona! ',
            READ_TIMER_ERROR_MSG: 'No he podido leer el estado del temporizador. Perdona! ',
            DELETE_TIMER_OK_MSG: 'Tu temporizador ha sido eliminado! Si quieres crear otro prueba deciendo, crea un temporizador de, seguido de la duración. ',
            DELETE_TIMER_ERROR_MSG: 'No he podido eliminar el temporizador. Perdona! ',
            PAUSE_TIMER_OK_MSG: 'Tus temporizadores están ahora en pausa! Si quieres reanudarlos prueba decir, reanuda mis temporizadores. ',
            PAUSE_TIMER_ERROR_MSG: 'No he podido pausar tus temporizadores. Perdona! ',
            RESUME_TIMER_OK_MSG: 'Tus temporizadores han sido reanudados! Si quieres pausarlos prueba decir, pon mis temporizadores en pausa. ',
            RESUME_TIMER_ERROR_MSG: 'No he podido reanudar tus temporizadores. Perdona! ',
            ON_TIMER_STATUS_MSG: ' esta corriendo',
            OFF_TIMER_STATUS_MSG: ' está apagado',
            PAUSED_TIMER_STATUS_MSG: ' está en pausa'
        }
    },
    ja: {
        translation: {
            WELCOME_MSG: 'ようこそ。このスキルでは、５分のタイマーをセットして、のようにタイマーの時間を設定することができます。どうしますか？',
            HELP_MSG: '起動中のタイマーを確認するには、タイマーをチェックして。停止する場合は、タイマーを停止して。再開する場合は、タイマーを再開して。削除したい場合は、タイマーを削除して。と指示することができます。どうしますか？',
            REPROMPT_MSG: `次は、どうしますか？`,
            GOODBYE_MSG: ['それではまた', 'またね', 'また使ってくださいね', 'バイバイ'],
            REFLECTOR_MSG: '{{intent}}がトリガーされました',
            FALLBACK_MSG: `すみません。ちょっとわかりませんでした。もう一度話してみてください。`,
            ERROR_MSG: 'すみません。なんだかうまく行かないみたいです。もう一度話してみてください。',
            PERMISSIONS_CARD_MSG: 'お客様のAlexaアプリに、このスキルがタイマーを使用することを許可するためのカードを送りました。権限を許可していただいた後に、もう一度このスキルを呼び出してください。',
            TIMER_COUNT_MSG: '現在、{{count}}個のタイマーがセットされています。',
            TIMER_COUNT_MSG_plural: '現在、{{count}}個のタイマーがセットされています。',
            LAST_TIMER_MSG: 'お客様のタイマーは、現在 {{status}}',
            NO_TIMER_MSG: `現在、タイマーがセットされていません。タイマーをセットして、と言ってみてください。`,
            ANNOUNCEMENT_TIMER_TITLE_MSG: 'タイマーのお知らせ',
            ANNOUNCEMENT_LOCALE_MSG: 'ja-JP',
            ANNOUNCEMENT_TEXT_MSG: 'お知らせです。',
            TASK_TIMER_TITLE_MSG: 'タスクのお知らせです',
            TASK_LOCALE_MSG: 'ja-JP',
            TASK_TEXT_MSG: 'タイマーの時間が経過しました。{continueWithSkillName}を呼び出しますか？',
            VOICE_PERMISSION_ACCEPTED: 'それでは、セットしたい時間で、「何分のタイマーをセットして」のように言ってみてください。',
            VOICE_PERMISSION_DENIED: 'タイマーの使用許可をいただけなかったので、このスキルを続けることができません。後ほどもう一度お試しください。',
            VOICE_PERMISSION_ERROR: 'タイマーの使用許可をいただく途中でエラーが起きてしまいました。後ほどもう一度お試しください。',
            CREATE_TIMER_OK_MSG: 'タイマーは起動中です。確認したい場合は、タイマーをチェックして。と言ってみてください。',
            CREATE_TIMER_ERROR_MSG: 'タイマーのセットに失敗しました。ごめんなさい。',
            READ_TIMER_ERROR_MSG: 'タイマーの状態を調べるのに失敗しました。ごめんなさい。',
            DELETE_TIMER_OK_MSG: 'タイマーは削除されました。別のタイマーをセットしたい場合は、「何分のタイマーをセットして」のように言ってみてください',
            DELETE_TIMER_ERROR_MSG: 'タイマーの削除に失敗しました。ごめんなさい。',
            PAUSE_TIMER_OK_MSG: 'タイマーは停止中です。再開する場合は、タイマーを再開して。と言ってください。',
            PAUSE_TIMER_ERROR_MSG: 'タイマーの停止に失敗しました。ごめんなさい。',
            RESUME_TIMER_OK_MSG: 'タイマーを再開しました。再び停止させたい場合は、タイマーを停止して、と言ってください。 ',
            RESUME_TIMER_ERROR_MSG: 'タイマーの再開に失敗しました。ごめんなさい。',
            ON_TIMER_STATUS_MSG: '起動中です。',
            OFF_TIMER_STATUS_MSG: 'オフになっています。',
            PAUSED_TIMER_STATUS_MSG: '停止中です。'
        }
    }
}
