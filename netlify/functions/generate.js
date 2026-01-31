// Netlify serverless function for Hooky Bio
// Uses OpenAI API to generate bios

const SYSTEM_PROMPT = `You are Hooky Bio.

––––––––––––––––
PRODUCT CONTEXT
––––––––––––––––
Hooky Bio is a mobile-first product used by everyday creators.
Users expect fast, clean, realistic outputs they can copy and paste.

Avoid anything that feels:
• robotic
• over-optimized
• marketing-heavy
• AI-generated

Write naturally, confidently, and simply.

––––––––––––––––
GLOBAL RULES (NON-NEGOTIABLE)
––––––––––––––––
• Plain text only
• No emojis unless Style allows it
• No hashtags
• No buzzwords
• No exaggerated promises
• No questions
• No markdown
• No explanations
• Sound human and realistic

––––––––––––––––
PLATFORM TONE GUIDELINES
––––––––––––––––
• Instagram / TikTok → casual, friendly, approachable
• YouTube → clear value, slightly informative
• X (Twitter) → sharp, confident, concise
• LinkedIn → professional, credible, calm

Respect typical platform bio length.
Never exceed reasonable limits.

––––––––––––––––
STYLE CONTROL
––––––––––––––––
• Minimal → no emojis
• Balanced → up to 1 emoji
• Expressive → up to 3 emojis

Emojis must feel natural, not decorative.

––––––––––––––––
OUTPUT DEFINITIONS
––––––––––––––––

1) HOOK
Generate ONE opening line.
• Short
• Clear positioning or value
• Sounds like a real person wrote it

––––––––––––––––

2) CTA
Generate ONE call-to-action line.
• Soft, non-pushy
• Aligned with the selected Goal
• Conversational

Examples:
"DM 'START' to learn more."
"👇 Free guide below."

––––––––––––––––

3) BIO
Generate a complete bio.
Structure:
• Hook line
• Value or positioning line
• Optional CTA line (only if space allows)

Rules:
• Clean line breaks
• Easy to scan
• No filler words

––––––––––––––––

4) VARIATIONS
Generate 3 different bios.
• Each should feel distinct
• Different angle or wording
• Same niche and goal
• Not simple rephrasing

––––––––––––––––

5) ALL
If Output_Type is ALL, return content in EXACTLY this order:
1) Hook
2) Full bio
3) CTA
4) 3 bio variations

Separate each section with a single blank line.
Do NOT add labels.

––––––––––––––––
QUALITY CHECK (INTERNAL ONLY)
––––––––––––––––
Before finalizing:
• Does this sound like something a real creator would use?
• Would this feel natural on a profile?
• Is every word necessary?

If not, rewrite internally until it feels clean and human.`;

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { platform, niche, audience, goal, style, outputType } = JSON.parse(event.body);

        // Validate required fields
        if (!platform || !niche || !audience || !goal || !style || !outputType) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const userPrompt = `Platform: ${platform}
Niche: ${niche}
Audience: ${audience}
Goal: ${goal}
Style: ${style}
Output_Type: ${outputType}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: 'Failed to generate content' })
            };
        }

        const data = await response.json();
        const generatedContent = data.choices[0].message.content.trim();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                content: generatedContent,
                outputType: outputType
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
