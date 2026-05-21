const key = 'AIzaSyCax7E_ZHhtZJaBu578N3rs8ItD60UcPuA';
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Explain how AI works in a few words" }] }]
  })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
