/**
 * IELTS Speaking Quest — Story Multiplier Clusters
 * Connects 15–20 core life stories to all 62 forecast cue cards
 */

const storyClusters = [
  {
    "id": 1,
    "title": "My Mother / Inspiring Family Member",
    "emoji": "👩‍🏫",
    "description": "A master narrative about an inspiring, organized, and selfless mother who overcomes hardships and supports others.",
    "topicIds": [
      1,
      6,
      13,
      25,
      45
    ],
    "narrative": "Focus on your mother (or family member) demonstrating exceptional planning skills (#13), volunteering to assist neighbours (#6), motivating you to pursue difficult goals (#25), achieving a challenging career or personal milestone (#45), and making the whole family proud (#1)."
  },
  {
    "id": 2,
    "title": "Cua Lo Beach Trip",
    "emoji": "🏖️",
    "description": "A coastal holiday road trip that adapts to nature, relaxation, travel recommendations, and contrasting perspectives.",
    "topicIds": [
      11,
      22,
      29,
      43,
      44,
      57
    ],
    "narrative": "A memorable road trip to Cua Lo beach. Frame it as a peaceful escape with soothing ocean waves (#11), an ideal scenic town to visit or reside (#22, #29), a top holiday recommendation (#43), an off-season visit with limited nightlife (#44), or a distant travel goal (#57)."
  },
  {
    "id": 3,
    "title": "20th Birthday Celebration",
    "emoji": "🎂",
    "description": "A cozy apartment birthday party filled with surprise gifts, festive cuisine, and joyful memories.",
    "topicIds": [
      4,
      8,
      26,
      62
    ],
    "narrative": "Celebrating a milestone 20th birthday at an apartment with close friends. Features memorable gifts (#8), delicious homemade and special festive dishes (#26), a surprise custom-decorated cake (#62), and a room full of smiling faces (#4)."
  },
  {
    "id": 4,
    "title": "G-Dragon Concert with Lan",
    "emoji": "🎵",
    "description": "A thrilling late-night music concert adventure testing quick thinking and friendship.",
    "topicIds": [
      14,
      19,
      23,
      54
    ],
    "narrative": "Attending a massive concert for the first time (#54). Experience dynamic live performances (#14), dealing with overwhelming or unwanted background noise (#19), and best friend Lan cleverly seeking help from nearby police officers when phone batteries died (#23)."
  },
  {
    "id": 5,
    "title": "Traffic & Air Pollution in City",
    "emoji": "🚗",
    "description": "Urban mobility challenges, environmental awareness, and legislative solutions.",
    "topicIds": [
      10,
      25,
      46
    ],
    "narrative": "Observing heavy urban congestion and exhaust fumes during a road journey (#10), encouraging friends to switch to cycling (#25), and proposing progressive environmental taxes on private vehicles to reduce emissions (#46)."
  },
  {
    "id": 6,
    "title": "Shopee & Tech Gadgets",
    "emoji": "📱",
    "description": "Everyday e-commerce, gadget ownership, technical glitches, and budget decisions.",
    "topicIds": [
      7,
      18,
      21,
      35
    ],
    "narrative": "Using e-commerce platforms like Shopee regularly (#7), investing in essential smart devices (#18), encountering an unexpected defect or unexpected fee (#21), and troubleshooting hardware or electrical issues (#35)."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storyClusters };
}

if (typeof window !== 'undefined') {
  window.storyClusters = storyClusters;
}
