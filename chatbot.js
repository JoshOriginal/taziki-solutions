(function () {
  'use strict';

  const STAGES = ['RAPPORT', 'NEEDS_ANALYSIS', 'PRESENTATION', 'OBJECTION', 'CLOSE', 'FOLLOW_UP'];
  const STORAGE_KEY = 'taziki-chat-state';
  const CONFIG_URL = '/config/business.json';
  const existingForm = document.getElementById('chatForm');
  const chatMessages = document.getElementById('chatMessages');

  if (!existingForm || !chatMessages) return;

  // Detach any legacy inline listener before installing the shared handler.
  const chatForm = existingForm.cloneNode(true);
  existingForm.replaceWith(chatForm);
  const chatInput = chatForm.querySelector('#chatInput');

  let config;
  let state = loadState();
  const configPromise = fetch(CONFIG_URL).then(response => {
    if (!response.ok) throw new Error('Business configuration could not be loaded');
    return response.json();
  }).then(data => {
    config = data;
    return data;
  });

  chatForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    chatInput.value = '';

    try {
      await configPromise;
      const result = respond(message);
      saveState();
      setTimeout(() => addMessage('bot', result.reply), 400);
    } catch (error) {
      console.error('Chatbot error:', error);
      setTimeout(() => addMessage('bot', 'I\'m having trouble loading my service information. Please email ' + (config?.contact?.email || 'info@tazikisolutions.com') + ' and our team will help.'), 400);
    }
  });

  function addMessage(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start mb-4';
    const bubble = document.createElement('div');
    bubble.className = type === 'bot'
      ? 'bg-dark-lighter rounded-lg rounded-tl-none p-3 max-w-[80%]'
      : 'ml-auto bg-secondary/20 rounded-lg rounded-tr-none p-3 max-w-[80%]';
    const text = document.createElement('p');
    text.className = 'text-white text-sm';
    text.textContent = message;
    bubble.appendChild(text);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (saved && STAGES.includes(saved.stage) && saved.needs) return saved;
    } catch (error) {
      // Start a fresh conversation when storage is unavailable or invalid.
    }
    return { stage: 'RAPPORT', needs: {} };
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // The chat remains usable when browser storage is disabled.
    }
  }

  function respond(rawMessage) {
    const message = rawMessage.toLowerCase();
    const handOffKeyword = config.escalationRules.handOffKeywords.find(keyword => message.includes(keyword));
    if (handOffKeyword) {
      state.needs.handOff = true;
      console.warn('Chatbot hand-off requested:', handOffKeyword);
      return { reply: config.escalationRules.handOffMessage, next_stage: state.stage, needs_update: { handOff: true } };
    }

    updateNeeds(message);
    let reply;
    let nextStage = state.stage;

    if (hasObjection(message)) {
      reply = objectionReply(message);
      nextStage = 'CLOSE';
    } else if (state.stage === 'RAPPORT') {
      reply = rapportReply(message);
      nextStage = 'NEEDS_ANALYSIS';
    } else if (state.stage === 'NEEDS_ANALYSIS') {
      reply = needsReply(message);
      if (hasNeedSignal(message)) nextStage = 'PRESENTATION';
    } else if (state.stage === 'PRESENTATION') {
      reply = presentationReply(message);
    } else if (state.stage === 'CLOSE') {
      reply = closeReply(message);
      nextStage = 'FOLLOW_UP';
    } else {
      reply = followUpReply(message);
    }

    state.stage = nextStage;
    return { reply, next_stage: nextStage, needs_update: state.needs };
  }

  function updateNeeds(message) {
    const service = findService(message);
    if (service) state.needs.service = service.category;
    const scaleMatch = message.match(/\b(?:up to|about|around|for)\s+(\d+)\s+(?:devices|people|users|cameras|pages|workstations)/i);
    if (scaleMatch) state.needs.scale = scaleMatch[1] + ' ' + scaleMatch[0].split(' ').slice(-1)[0];
    if (message.includes('new office') || message.includes('setting up')) state.needs.trigger = 'new office or setup';
    if (message.includes('upgrade') || message.includes('outdated') || message.includes('slow')) state.needs.trigger = 'upgrade or existing problem';
    if (message.includes('customer') || message.includes('sales')) state.needs.goal = 'reach or convert customers';
    if (message.includes('staff') || message.includes('operation')) state.needs.goal = 'streamline operations';
    if (message.includes('security') || message.includes('theft') || message.includes('protect')) state.needs.goal = 'protect premises and assets';
  }

  function findService(message) {
    const aliases = [
      ['Network Cabling & Smart Building Integration', ['network', 'cabling', 'smart building', 'wifi', 'wi-fi']],
      ['App Development', ['app', 'mobile', 'android', 'ios']],
      ['Website Development', ['website', 'web site', 'web design', 'e-commerce', 'ecommerce']],
      ['CCTV Installations', ['cctv', 'camera', 'security', 'surveillance']]
    ];
    const match = aliases.find(item => item[1].some(alias => message.includes(alias)));
    return match ? config.services.find(service => service.category === match[0]) : null;
  }

  function hasNeedSignal(message) {
    return Boolean(findService(message) || message.length > 35 || state.needs.trigger || state.needs.goal);
  }

  function hasObjection(message) {
    return ['too expensive', 'expensive', 'need to think', 'think about it', 'in-house', 'in house', 'do it myself', 'template'].some(term => message.includes(term));
  }

  function rapportReply(message) {
    if (message.includes('where') || message.includes('location')) return 'We are based in ' + config.contact.location + ' and work with businesses across East Africa. What brought you to Taziki Solutions today?';
    if (message.includes('about') || message.includes('company')) return config.valueProposition + ' What prompted you to look for a technology partner today?';
    return 'Welcome. I\'m ' + config.botName + ' from ' + config.companyName + '. What prompted you to start looking for a solution today?';
  }

  function needsReply(message) {
    if (message.includes('contact') || message.includes('email') || message.includes('phone')) return 'You can reach our team at ' + config.contact.email + ' or ' + config.contact.phone + '. Before we point you to the best fit, what are you hoping to improve or achieve?';
    if (message.includes('service') || message.includes('offer')) return 'We help with networks and smart buildings, apps, websites, and CCTV. Which part of your business or property needs attention right now?';
    return 'That helps me understand the context. What have you tried so far, and roughly how large is the business, property, or team involved?';
  }

  function chooseTier(service, message) {
    if (service.category === 'CCTV Installations' && (message.includes('home') || message.includes('house'))) return service.tiers[0];
    if (message.includes('large') || message.includes('campus') || message.includes('enterprise')) return service.tiers[2];
    if (message.includes('small') || message.includes('starter') || message.includes('10 device')) return service.tiers[0];
    return service.tiers[1];
  }

  function presentationReply(message) {
    const service = findService(message) || config.services.find(item => item.category === state.needs.service) || config.services[0];
    const tier = chooseTier(service, message);
    state.needs.service = service.category;
    state.needs.tier = tier.name;
    const benefit = service.coreBenefits[0];
    const offer = service.specialOffers[0];
    return 'Based on what you shared, I recommend the ' + tier.name + ' for ' + service.category + ' at ' + tier.price + '. It is ' + tier.description.toLowerCase() + ', helping you get ' + benefit.toLowerCase() + '. ' + offer + '. Would you like to look at the next step?';
  }

  function objectionReply(message) {
    const service = config.services.find(item => item.category === state.needs.service) || config.services[0];
    if (message.includes('think')) return 'That makes sense, and others have felt they needed more time too. They often found that clarifying the one unresolved concern made the decision easier; what part would you like to think through?';
    return 'I understand why the investment might feel high, and other clients have felt the same. They found that avoiding repeat fixes, downtime, or missed customers made doing it right once worthwhile. We can also start with ' + service.specialOffers[0].toLowerCase() + '. Would you prefer to move forward with this fit or review a smaller tier?';
  }

  function closeReply() {
    return 'Great. Shall we arrange the ' + (state.needs.tier || 'recommended package') + ', or would you prefer the next smaller option? You can start by emailing ' + config.contact.email + ' or calling ' + config.contact.phone + '.';
  }

  function followUpReply(message) {
    if (message.includes('yes') || message.includes('ready') || message.includes('proceed')) return 'Excellent. Our team will take it from here. Please email ' + config.contact.email + ' or call ' + config.contact.phone + ' so we can confirm the details.';
    return 'Of course, take the time you need. I\'ll leave the door open, and you can reach us at ' + config.contact.email + ' or ' + config.contact.phone + ' whenever you are ready.';
  }

  function buildSystemPrompt(currentState) {
    const serviceText = config.services.map(service => [
      service.category + ' | Best for: ' + service.bestFor,
      'Benefits: ' + service.coreBenefits.join('; '),
      'Tiers: ' + service.tiers.map(tier => tier.name + ' (' + tier.price + '): ' + tier.description + '. Features: ' + tier.features.join(', ')).join(' | '),
      'Offers: ' + service.specialOffers.join('; ')
    ].join('\n')).join('\n\n');
    return 'You are ' + config.botName + ' for ' + config.companyName + '. Tone: ' + config.tone + '. Value proposition: ' + config.valueProposition + '\n\nCurrent stage: ' + currentState.stage + '. State: ' + JSON.stringify(currentState.needs) + '\n\nAct in exactly one stage per turn and never skip stages. RAPPORT: warm opener, no pitch or pricing, one genuine question. NEEDS_ANALYSIS: ask one open question about trigger, what was tried, and rough scale; do not recommend yet. PRESENTATION: recommend one category and one fitting tier, sell benefits, and give the configured price when asked. OBJECTION: use Feel-Felt-Found. CLOSE: use a low-pressure alternative or assumptive close and give one concrete contact step. FOLLOW_UP: confirm next steps warmly or leave the door open without pressure. Keep replies to 2-4 chat-native sentences, with no markdown or walls of text. Never invent pricing, timelines, or guarantees not present in the config. If a hand-off keyword appears, stop selling and return exactly the hand-off message.\n\nServices:\n' + serviceText + '\n\nCommon objections:\n' + config.commonObjections.map(item => item.objection + ': ' + item.angle).join('\n') + '\n\nContact: ' + config.contact.email + ', ' + config.contact.phone + ', ' + config.contact.location;
  }

  window.tazikiChatbot = { getState: () => state, buildSystemPrompt };
})();
