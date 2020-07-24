// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./localisation');
const CONSTANTS = require('./constants');

const TIMERS_PERMISSION = 'alexa::alerts:timers:skill:readwrite';
// change to test different types of timers
const TIMER_FUNCTION = getAnnouncementTimer;
//const TIMER_FUNCTION = getPredefinedTaskLaunchTimer;
//const TIMER_FUNCTION = getCustomTaskLaunchTimer;

// Custom parameters is used in place of handlerInput if present
function getAnnouncementTimer(handlerInput, duration, customParameters = {}) {
	console.log(`handlerInput : ${JSON.stringify(handlerInput)}, duration ; ${duration}, customParameters : ${JSON.stringify(customParameters)}`)

    // Checks custom parameters and uses values if present, otherwise uses handlerInput
    let customLabel = '';
    if (customParameters && customParameters.label) {
    	customLabel = customParameters.label;
    } else {
    	customLabel = handlerInput.t('ANNOUNCEMENT_TIMER_TITLE_MSG');
    }
    
    let customAnnouncement = '';
    if (customParameters && customParameters.announcementMessage) {
    	customAnnouncement = customParameters.announcementMessage;
    } else {
    	customAnnouncement = handlerInput.t('ANNOUNCEMENT_TEXT_MSG');
    }
    
    console.log(`customLabel : ${customLabel}, customAnnouncement : ${customAnnouncement}`);
    return {
    	duration: duration,
    	label: customLabel,
    	creationBehavior: {
    		displayExperience: {
    			visibility: 'VISIBLE'
    		}
    	},
    	triggeringBehavior: {
    		operation: {
    			type : 'ANNOUNCE',
    			textToAnnounce: [{
    				locale: 'en-US',
    				text: customAnnouncement
    			}]
    		},
    		notificationConfig: {
    			playAudible: true
    		}
    	}
    };
}

function getPredefinedTaskLaunchTimer(handlerInput, duration, customParameters = {}) {
    console.log(`handlerInput : ${JSON.stringify(handlerInput)}, duration ; ${duration}, customParameters : ${JSON.stringify(customParameters)}`)

    // Checks custom parameters and uses values if present, otherwise uses handlerInput
    let customLabel = '';
    if (customParameters && customParameters.label) {
    	customLabel = customParameters.label;
    } else {
    	customLabel = handlerInput.t('ANNOUNCEMENT_TIMER_TITLE_MSG');
    }
    
    let customAnnouncement = '';
    if (customParameters && customParameters.announcementMessage) {
    	customAnnouncement = customParameters.announcementMessage;
    } else {
    	customAnnouncement = handlerInput.t('ANNOUNCEMENT_TEXT_MSG');
    }
    
    console.log(`customLabel : ${customLabel}, customAnnouncement : ${customAnnouncement}`);
    
	return {
		duration: duration,
		label: customLabel,
		creationBehavior: {
			displayExperience: {
				visibility: 'VISIBLE'
			}
		},
		triggeringBehavior: {
			operation: {
				type : 'LAUNCH_TASK',
				textToConfirm: [{
					locale: 'en-US',
					text: customAnnouncement
				}],
				task : {
					name : 'SetBreak',
					version : '1',
					input : {
						'@type': 'ScheduleTaxiReservationRequest',
						'@version': '1'
						// No variables needed for set break intent, no customization available
					}
				}
			},
			notificationConfig: {
				playAudible: true
			}
		}
	};
}

function verifyConsentToken(handlerInput){
	let {requestEnvelope} = handlerInput;
	const {permissions} = requestEnvelope.context.System.user;
	if (!(permissions && permissions.consentToken)){
		console.log('No permissions found!');
        // we send a request to enable by voice
        // note that you'll need another handler to process the result, see AskForResponseHandler
        return handlerInput.responseBuilder
        .addDirective({
        	type: 'Connections.SendRequest',
        	'name': 'AskFor',
        	'payload': {
        		'@type': 'AskForPermissionsConsentRequest',
        		'@version': '1',
        		'permissionScope': TIMERS_PERMISSION
        	},
        	token: 'verifier'
        }).getResponse();
    }
    console.log('Permissions found: ' + permissions.consentToken);
    return null;
}

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
	},
	handle(handlerInput) {
		const speechOutput = handlerInput.t('WELCOME_MSG');
		return handlerInput.responseBuilder
		.speak(speechOutput)
		.reprompt(speechOutput)
		.getResponse();
	}
};

const ReadTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'ReadTimerIntent';
	},
	async handle(handlerInput) {
		const {attributesManager, serviceClientFactory} = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes();
		let timerId = sessionAttributes['lastTimerId'];

		try {
			const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
			const timersList = await timerServiceClient.getTimers();
			console.log('Read timers: ' + JSON.stringify(timersList));
			const totalCount = timersList.totalCount;
			const preText = totalCount ? handlerInput.t('TIMER_COUNT_MSG', {count: totalCount}) : '';
			if(timerId || totalCount > 0) {
				timerId = timerId ? timerId : timersList.timers[0].id; 
				let timerResponse = await timerServiceClient.getTimer(timerId);       
				console.log('Read timer: ' + JSON.stringify(timerResponse));
				const timerStatus = timerResponse.status;
				return handlerInput.responseBuilder
				.speak(preText + handlerInput.t('LAST_TIMER_MSG', {status: handlerInput.t(timerStatus + '_TIMER_STATUS_MSG')}) + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			} else {
				return handlerInput.responseBuilder
				.speak(preText + handlerInput.t('NO_TIMER_MSG') + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			}
		} catch (error) {
			console.log('Read timer error: ' + JSON.stringify(error));
			if(error.statusCode === 401) {
				console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('READ_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
}

const SetTemplateTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'SetTemplateTimerIntent';
	},
	async handle(handlerInput) {
		const {requestEnvelope, attributesManager, serviceClientFactory} = handlerInput;
		const activityCategory = Alexa.getSlotValue(requestEnvelope, 'activity');

		console.log('SetTemplateTimerIntentHandler');

		let duration = 0;
		switch (activityCategory) {
			case 'independent':
			duration = CONSTANTS.ACTIVITY_TIMES.INDEPENDENT;
			break;
			case 'homework':
			duration = CONSTANTS.ACTIVITY_TIMES.HOMEWORK;
			break;
			case 'long group':
			duration = CONSTANTS.ACTIVITY_TIMES.LONG_GROUP;
			break;
			case 'group':
			duration = CONSTANTS.ACTIVITY_TIMES.GROUP;
			break;
			case 'transition':
			duration = CONSTANTS.ACTIVITY_TIMES.TRANSITION;
			break;
		}

        // Sets the name of the timer in TIMER_FUNCTION
        let parameters = {
        	label : `${activityCategory} timer`,
        	announcementMessage : `${activityCategory} time is up!`
        };
        
        const timer = TIMER_FUNCTION(handlerInput, duration, parameters);
        console.log('About to create timer: ' + JSON.stringify(timer));
        
        try {
        	const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
        	const timersList = await timerServiceClient.getTimers();
        	console.log('Current timers: ' + JSON.stringify(timersList));

        	const timerResponse = await timerServiceClient.createTimer(timer);
        	console.log('Timer creation response: ' + JSON.stringify(timerResponse));

        	const timerId = timerResponse.id;
        	const timerStatus = timerResponse.status;

        	const timerDuration = timerResponse.duration;
        	const timerHours = (() => {
        		const timerHoursArray = timerDuration.match(/(\d+H)/);
        		if (timerHoursArray) {
        			const timerHoursWithLetter = timerHoursArray[timerHoursArray.length - 1];
        			return timerHoursWithLetter.substring(0, timerHoursWithLetter.length - 1);
        		} else {
        			return null;
        		}
        	})();
        	const timerMinutes = (() => {
        		const timerMinutesArray = timerDuration.match(/(\d+M)/);
        		if(timerMinutesArray) {
        			const timerMinutesWithLetter = timerMinutesArray[timerMinutesArray.length - 1];
        			return timerMinutesWithLetter.substring(0, timerMinutesWithLetter.length - 1);
        		} else {
        			return null;
        		}
        	})();
        	const hourMinuteStatement = (() => {
        		let response = '';

        		if (timerHours) {
        			response = response + `${timerHours} hours`
        		}
        		if (response && timerMinutes) {
        			response = response + ` and ${timerMinutes} minutes`    
        		} else {
        			response = response + `${timerMinutes} minutes`
        		}
        		return response;
        	})();
        	console.log('timerHours', timerHours, 'timerMinutes', timerMinutes, 'hourMinuteStatement', hourMinuteStatement)

        	if(timerStatus === 'ON') {
        		const sessionAttributes = attributesManager.getSessionAttributes();
        		sessionAttributes['lastTimerId'] = timerId;

        		return handlerInput.responseBuilder
        		.speak(hourMinuteStatement + ' of ' + activityCategory + ' time has begun! If you would like a halfway notification, say add halfway notification.')
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
                } else
                throw { statusCode: 308, message: 'Timer did not start' };
                
            } catch (error) {
            	console.log('Create timer error: ' + JSON.stringify(error));
            	if(error.statusCode === 401) {
            		console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('CREATE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
};

const SetHalfwayTemplateTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'SetHalfwayTemplateTimerIntent';
	},
	async handle(handlerInput) {
		const {requestEnvelope, attributesManager, serviceClientFactory} = handlerInput;
        // const activityCategory = Alexa.getSlotValue(requestEnvelope, 'yesNo');

        console.log('SetHalfwayTemplateTimerIntentHandler');

        // Extract time of currently running timer, assumes only one class time timer is running
        const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
        const timerData = await timerServiceClient.getTimers();
        let timerDataString = JSON.stringify(timerData);
        let extractedDuration = '';
        let activityCategory = '';
        if (timerDataString.indexOf('independent time') > 0) {
        	extractedDuration = CONSTANTS.ACTIVITY_TIMES.INDEPENDENT;
        	activityCategory = 'independent';
        } else if (timerDataString.indexOf('group time') > 0) {
        	extractedDuration = CONSTANTS.ACTIVITY_TIMES.GROUP;
        	activityCategory = 'group';
        } else if (timerDataString.indexOf('long_group time') > 0) {
        	extractedDuration = CONSTANTS.ACTIVITY_TIMES.LONG_GROUP;
        	activityCategory = 'long_group';
        } else if (timerDataString.indexOf('homework time') > 0) {
        	extractedDuration = CONSTANTS.ACTIVITY_TIMES.HOMEWORK;
        	activityCategory = 'homework';
        } else if (timerDataString.indexOf('transition time') > 0) {
        	extractedDuration = CONSTANTS.ACTIVITY_TIMES.TRANSITION;
        	activityCategory = 'transition';
        }
        console.log('extractedDuration:', extractedDuration, 'activityCategory:', activityCategory);
        
        // Extracts hours and minutes from ISO 8601 format
        const timerHours = (() => {
        	const timerHoursArray = extractedDuration.match(/(\d+H)/);
        	if (timerHoursArray) {
        		const timerHoursWithLetter = timerHoursArray[timerHoursArray.length - 1];
        		return timerHoursWithLetter.substring(0, timerHoursWithLetter.length - 1);
        	} else {
        		return null;
        	}
        })();
        const timerMinutes = (() => {
        	const timerMinutesArray = extractedDuration.match(/(\d+M)/);
        	if(timerMinutesArray) {
        		const timerMinutesWithLetter = timerMinutesArray[timerMinutesArray.length - 1];
        		return timerMinutesWithLetter.substring(0, timerMinutesWithLetter.length - 1);
        	} else {
        		return null;
        	}
        })();

        // Halves time and creates ISO 8601 format statement for halftime timer
        const halfISO8601Statement = (() => {
        	let response = 'PT';

        	let halfHours = 0;
        	let halfMinutes = 0;
        	let halfSeconds = 0;

            // If the timer has an hours component, divide it in half and assign halfMinutes
            if (timerHours) {
            	halfHours = timerHours / 2;
            	if (halfHours == 0) {
            		halfMinutes = 30
            	}
            	if (halfHours % 1 != 0) {
            		halfMinutes = 30;
            		halfHours = halfHours - 0.5;
            	}
            }

            // If the timer has a minutes component, divide it in half and add to halfMinutes and assign halfSeconds
            if (timerMinutes) {
            	halfMinutes = halfMinutes + timerMinutes / 2;
                // If it's a decimal
                if (halfMinutes % 1 != 0) {
                	halfSeconds = 30;
                	halfMinutes = halfMinutes - 0.5;
                }
            }

            if (halfHours) {
            	response = response + halfHours.toString() + 'H';
            }
            if (halfMinutes) {
            	response = response + halfMinutes.toString() + 'M';
            }
            if (halfSeconds) {
            	response = response + halfSeconds.toString() + 'S';
            }

            return response;

        })();
        console.log('halfISO8601Statement', halfISO8601Statement);

        let halfwayParameters = {
        	label : `Halfway timer`,
        	announcementMessage : `We're halfway through ${activityCategory} time! If you would like a break, say start break in class time`
        };

        const timer = TIMER_FUNCTION({}, halfISO8601Statement, halfwayParameters);
        console.log('About to create timer for halfway point: ' + JSON.stringify(timer));

try {
	const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
	const timersList = await timerServiceClient.getTimers();
	console.log('Current timers: ' + JSON.stringify(timersList));

	const timerResponse = await timerServiceClient.createTimer(timer);
	console.log('Timer creation response: ' + JSON.stringify(timerResponse));

	const timerId = timerResponse.id;
	const timerStatus = timerResponse.status;

	const timerDuration = timerResponse.duration;



	if(timerStatus === 'ON') {
		const sessionAttributes = attributesManager.getSessionAttributes();
		sessionAttributes['lastTimerId'] = timerId;

		return handlerInput.responseBuilder
		.speak(`You will be notified halfway through ${activityCategory} time!`)
                    // .reprompt()
                    .getResponse();
                } else
                throw { statusCode: 308, message: 'Timer did not start' };

            } catch (error) {
            	console.log('Create timer error: ' + JSON.stringify(error));
            	if(error.statusCode === 401) {
            		console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('CREATE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
};

const SetBreakIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SetBreakIntent';
    },
    async handle(handlerInput) {
        const {requestEnvelope, attributesManager, serviceClientFactory} = handlerInput;
        const breakType = Alexa.getSlotValue(requestEnvelope, 'break');
        const duration = 'PT5M';
        
        console.log('SetBreakIntentHandler');
        
        // Sets the name of the timer in TIMER_FUNCTION
        let parameters = {
            label : `${breakType} timer`,
            announcementMessage : `${breakType} time is up!`
        };
        
        const timer = TIMER_FUNCTION(handlerInput, duration, parameters);
        console.log('About to create timer: ' + JSON.stringify(timer));
        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Current timers: ' + JSON.stringify(timersList));

            const timerResponse = await timerServiceClient.createTimer(timer);
            console.log('Timer creation response: ' + JSON.stringify(timerResponse));
            
            const timerId = timerResponse.id;
            const timerStatus = timerResponse.status;
            
            const timerDuration = timerResponse.duration;
            const timerHours = (() => {
                const timerHoursArray = timerDuration.match(/(\d+H)/);
                if (timerHoursArray) {
                    const timerHoursWithLetter = timerHoursArray[timerHoursArray.length - 1];
                    return timerHoursWithLetter.substring(0, timerHoursWithLetter.length - 1);
                } else {
                    return null;
                }
            })();
            const timerMinutes = (() => {
                const timerMinutesArray = timerDuration.match(/(\d+M)/);
                if(timerMinutesArray) {
                    const timerMinutesWithLetter = timerMinutesArray[timerMinutesArray.length - 1];
                    return timerMinutesWithLetter.substring(0, timerMinutesWithLetter.length - 1);
                } else {
                    return null;
                }
            })();
            const hourMinuteStatement = (() => {
                let response = '';
                
                if (timerHours) {
                    response = response + `${timerHours} hours`
                }
                if (response && timerMinutes) {
                    response = response + ` and ${timerMinutes} minutes`    
                } else {
                    response = response + `${timerMinutes} minutes`
                }
                return response;
            })();

            if(timerStatus === 'ON') {
                const sessionAttributes = attributesManager.getSessionAttributes();
                sessionAttributes['lastTimerId'] = timerId;
                return handlerInput.responseBuilder
                    .speak(hourMinuteStatement + ' of ' + breakType + ' time has begun!' + handlerInput.t('MUSIC_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            } else
                throw { statusCode: 308, message: 'Timer did not start' };
                
        } catch (error) {
            console.log('Create timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                        .speak(handlerInput.t('CREATE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
                        .reprompt(handlerInput.t('REPROMPT_MSG'))
                        .getResponse();
        }
    }
};

const PlayMusicIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& (handlerInput.requestEnvelope.request.intent.name === 'PlayMusicIntent'
			|| handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent');
	},
	async handle(handlerInput) {
		console.log('Starting Music...');
		try {
			return handlerInput.responseBuilder
			.speak(handlerInput.t('now playing hit nation junior from eye heart radio!'))
			.addDirective({
				type: 'AudioPlayer.Play',
				'playBehavior': 'REPLACE_ALL',
				'audioItem':  { 
					"stream": {     
						"url": "https://ample.revma.ihrhls.com/zc6395/44_e0z301j8gdam02/playlist.m3u8",
						"token": "class-time-audio-stream",
						"offsetInMilliseconds": 0,
					}
				}
			}).getResponse();
		} catch (error) {
			console.log('Start Music error: ' + JSON.stringify(error));
		}
	}
};

const PauseMusicIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
	},
	async handle(handlerInput) {
		console.log('Pausing Music...');
		try {
			return handlerInput.responseBuilder
			.addDirective({
				type: "AudioPlayer.Stop"
			}).getResponse();
		} catch (error) {
			console.log('Pause Music error: ' + JSON.stringify(error));
		}
	}
};

const SetTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'SetTimerIntent';
	},
	async handle(handlerInput) {
		const {requestEnvelope, attributesManager, serviceClientFactory} = handlerInput;
		const duration = Alexa.getSlotValue(requestEnvelope, 'duration');

		const timer = TIMER_FUNCTION(handlerInput, duration);
		console.log('About to create timer: ' + JSON.stringify(timer));

		try {
			const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
			const timersList = await timerServiceClient.getTimers();
			console.log('Current timers: ' + JSON.stringify(timersList));

			const timerResponse = await timerServiceClient.createTimer(timer);
			console.log('Timer creation response: ' + JSON.stringify(timerResponse));

			const timerId = timerResponse.id;
			const timerStatus = timerResponse.status;

			if(timerStatus === 'ON') {
				const sessionAttributes = attributesManager.getSessionAttributes();
				sessionAttributes['lastTimerId'] = timerId;
				return handlerInput.responseBuilder
				.speak(handlerInput.t('CREATE_TIMER_OK_MSG') + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			} else
			throw { statusCode: 308, message: 'Timer did not start' };

		} catch (error) {
			console.log('Create timer error: ' + JSON.stringify(error));
			if(error.statusCode === 401) {
				console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('CREATE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
};

const DeleteTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'DeleteTimerIntent';
	},
	async handle(handlerInput) {
		const {attributesManager, serviceClientFactory} = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes();
		const timerId = sessionAttributes['lastTimerId'];

		try {
			const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
			const timersList = await timerServiceClient.getTimers();
			console.log('Read timers: ' + JSON.stringify(timersList));
			const totalCount = timersList.totalCount;
			if(totalCount === 0) {
				return handlerInput.responseBuilder
				.speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			}
			if(timerId) {
				await timerServiceClient.deleteTimer(timerId);
			} else {
                // warning, since there's no timer id we *cancel all 3P timers by the user*
                await timerServiceClient.deleteTimers();
            }
            console.log('Timer deleted!');
            return handlerInput.responseBuilder
            .speak(handlerInput.t('DELETE_TIMER_OK_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        } catch (error) {
        	console.log('Delete timer error: ' + JSON.stringify(error));
        	if(error.statusCode === 401) {
        		console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('DELETE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
}

const PauseTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
	},
	async handle(handlerInput) {
		const {serviceClientFactory} = handlerInput;

		try {
			const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
			const timersList = await timerServiceClient.getTimers();
			console.log('Read timers: ' + JSON.stringify(timersList));
			const totalCount = timersList.totalCount;

			if(totalCount === 0) {
				return handlerInput.responseBuilder
				.speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			}
            // pauses all timers
            for(const timer of timersList.timers ) {
            	if(timer.status === 'ON'){
            		await timerServiceClient.pauseTimer(timer.id);
            	}
            };
            return handlerInput.responseBuilder
            .speak(handlerInput.t('PAUSE_TIMER_OK_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        } catch (error) {
        	console.log('Pause timer error: ' + JSON.stringify(error));
        	if(error.statusCode === 401) {
        		console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('PAUSE_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
}

const ResumeTimerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
	},
	async handle(handlerInput) {
		const {serviceClientFactory} = handlerInput;

		try {
			const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
			const timersList = await timerServiceClient.getTimers();
			console.log('Read timers: ' + JSON.stringify(timersList));
			const totalCount = timersList.totalCount;

			if(totalCount === 0) {
				return handlerInput.responseBuilder
				.speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('REPROMPT_MSG'))
				.reprompt(handlerInput.t('REPROMPT_MSG'))
				.getResponse();
			}
            // resumes all timers
            for(const timer of timersList.timers ) {
            	if(timer.status === 'PAUSED'){
            		await timerServiceClient.resumeTimer(timer.id);
            	}
            }
            return handlerInput.responseBuilder
            .speak(handlerInput.t('RESUME_TIMER_OK_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        } catch (error) {
        	console.log('Resume timer error: ' + JSON.stringify(error));
        	if(error.statusCode === 401) {
        		console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                .addDirective({
                	type: 'Connections.SendRequest',
                	'name': 'AskFor',
                	'payload': {
                		'@type': 'AskForPermissionsConsentRequest',
                		'@version': '1',
                		'permissionScope': TIMERS_PERMISSION
                	},
                	token: 'verifier'
                }).getResponse();
            }
            else
            	return handlerInput.responseBuilder
            .speak(handlerInput.t('RESUME_TIMER_ERROR_MSG') + handlerInput.t('REPROMPT_MSG'))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
        }
    }
}

const AskForResponseHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
		&& handlerInput.requestEnvelope.request.name === 'AskFor';
	},
	async handle(handlerInput) {
		console.log('Handler: AskForResponseHandler');
		const {request} = handlerInput.requestEnvelope;
		const {payload, status} = request;
		console.log('Connections reponse status + payload: ' + status + ' - ' + JSON.stringify(payload));

		if (status.code === '200') {
			if (payload.status === 'ACCEPTED') {
                // Request was accepted
                handlerInput.responseBuilder
                .speak(handlerInput.t('VOICE_PERMISSION_ACCEPTED') + handlerInput.t('REPROMPT_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'));
            } else if (payload.status === 'DENIED') {
                // Request was denied
                handlerInput.responseBuilder
                .speak(handlerInput.t('VOICE_PERMISSION_DENIED') + handlerInput.t('GOODBYE_MSG'));
            } else if (payload.status === 'NOT_ANSWERED') {
                // Request was not answered
                handlerInput.responseBuilder
                .speak(handlerInput.t('VOICE_PERMISSION_DENIED') + handlerInput.t('GOODBYE_MSG'));
            }
            if(payload.status !== 'ACCEPTED' && !payload.isCardThrown){
            	handlerInput.responseBuilder
            	.speak(handlerInput.t('PERMISSIONS_CARD_MSG'))
            	.withAskForPermissionsConsentCard([TIMERS_PERMISSION]);
            }
            return handlerInput.responseBuilder.getResponse();
        }

        if (status.code === '400') {
        	console.log('You forgot to specify the permission in the skill manifest!')
        }
        // TODO There seems to be a bug right now that makes the server return a 500
        // but the permission is effectively enabled
        // remove the whole "if" block below when this is fixed
        if (status.code === '500') {
        	return handlerInput.responseBuilder
        	.speak(handlerInput.t('VOICE_PERMISSION_ACCEPTED') + handlerInput.t('REPROMPT_MSG'))
        	.reprompt(handlerInput.t('REPROMPT_MSG'))
        	.getResponse();
        }
        // Something failed.
        console.log(`Connections.Response.AskFor indicated failure. error: ${request.status.message}`);

        return handlerInput.responseBuilder
        .speak(handlerInput.t('VOICE_PERMISSION_ERROR') + handlerInput.t('GOODBYE_MSG'))
        .getResponse();
    }
};

const HelpIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
		&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speechOutput = handlerInput.t('HELP_MSG');

		return handlerInput.responseBuilder
		.speak(speechOutput)
		.reprompt(speechOutput)
		.getResponse();
	}
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
		&& (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
			|| Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speechOutput = handlerInput.t('GOODBYE_MSG');
		return handlerInput.responseBuilder
		.speak(speechOutput)
		.getResponse();
	}
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
	},
	handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
	},
	handle(handlerInput) {
		const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
		const speakOutput = handlerInput.t('REFLECTOR_MSG', {intent: intentName});

		return handlerInput.responseBuilder
		.speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
        }
    };

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`~~~~ Error handled: ${error.stack}`);
		const speechOutput = handlerInput.t('ERROR_MSG');

		return handlerInput.responseBuilder
		.speak(speechOutput)
		.reprompt(speechOutput)
		.getResponse();
	}
};

// This request interceptor will log all incoming requests to this lambda
const LoggingRequestInterceptor = {
	process(handlerInput) {
		console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
	}
};

// This request interceptor will bind a translation function 't' to the handlerInput
// Additionally it will handle picking a random value if instead of a string it receives an array
const LocalisationRequestInterceptor = {
	process(handlerInput) {
		const localisationClient = i18n.init({
			lng: Alexa.getLocale(handlerInput.requestEnvelope),
			resources: languageStrings,
			returnObjects: true
		});
		localisationClient.localise = function localise() {
			const args = arguments;
			const value = i18n.t(...args);
			if (Array.isArray(value)) {
				return value[Math.floor(Math.random() * value.length)];
			}
			return value;
		};
		handlerInput.t = function translate(...args) {
			return localisationClient.localise(...args);
		}
	}
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
.addRequestHandlers(
	LaunchRequestHandler,
	AskForResponseHandler,
	SetTemplateTimerIntentHandler,
	SetHalfwayTemplateTimerIntentHandler,	
	SetBreakIntentHandler,
	PlayMusicIntent,
	PauseMusicIntent,
	SetTimerIntentHandler,
	ReadTimerIntentHandler,
	DeleteTimerIntentHandler,
	PauseTimerIntentHandler,
	ResumeTimerIntentHandler,
	HelpIntentHandler,
	CancelAndStopIntentHandler,
	SessionEndedRequestHandler,
	IntentReflectorHandler
	)
.addErrorHandlers(
	ErrorHandler
	)
.addRequestInterceptors(
	LocalisationRequestInterceptor,
	LoggingRequestInterceptor
	)
.withApiClient(new Alexa.DefaultApiClient())
.withCustomUserAgent('sample/skill-demo-timers')
.lambda();
