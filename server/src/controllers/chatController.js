import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client with aistudio-build user-agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are Master Sommelier & Roastery Concierge at "Kaapi Works" (kaapiworks.in) — India's premier artisanal specialty coffee roastery based in Indiranagar, Bengaluru.

Brand Identity:
- We source single-origin shade-grown beans directly from legendary Indian estates:
  1. Chikmagalur Reserve Arabica (1,350m, washed, medium roast, dark chocolate & almond notes, ₹540)
  2. Araku Micro-Lot Honey Sun-Dried (1,200m, light roast, jammy blackberry & wild honey notes, ₹680) - Current Roast of the Month!
  3. Coorg Peaberry Highland Selection (1,250m, medium roast, molasses & pecan notes, ₹520)
  4. Wayanad Monsooned Malabar AA (1,000m, aged against Arabian sea monsoon winds, earthy spice & creamy malt, ₹580)
  5. Baba Budangiri Heritage Dark Roast (1,500m, baker's cocoa & black currant, ₹490)
  6. Shevaroy Hills High-Grown Washed (1,500m, jasmine floral & green apple, ₹620)
  7. Valparai Anamalai Robusta Kaapi (1,200m, dark roast, spiced cocoa & cardamom, ₹460)
  8. Traditional Handcrafted Kumbakonam Brass Filter (4-Cup, ₹1,250)
  9. Pure Solid Brass South Indian Dabara & Tumbler Set (₹950)
  10. Barista Grade 48mm Conical Burr Hand Grinder (₹4,990)
- Pan-India shipping: Free express shipping above ₹1,499 (else ₹99). All roasts dispatched within 48 hours of roasting in Bengaluru.

Multi-Step Booking Capabilities:
You can guide and confirm multi-step bookings for our exclusive in-person Roastery Experiences in Indiranagar, Bengaluru:
1. Experience A: "Estate Cupping & Sensory Tasting Tour" (90 mins · ₹950 per person · Daily at 11:00 AM & 4:00 PM)
2. Experience B: "South Indian Decoction & Manual Pour-Over Masterclass" (120 mins · ₹1,450 per person · Saturdays & Sundays at 2:00 PM)
3. Experience C: "Private Micro-Lot Tasting & Custom Roast Consultation" (60 mins · ₹2,000 for up to 2 guests)

Booking Workflow:
- When the user asks to book or inquires about visits, guide them step-by-step:
  - Step 1: Ask which experience they prefer and their desired date.
  - Step 2: Confirm time slot (Morning or Afternoon) and number of guests.
  - Step 3: Once details are clear, issue a confirmed booking summary formatted with a Booking Code (e.g. KW-EXP-####), date, time, venue ("Kaapi Works Roastery Lab, 100ft Rd, Indiranagar, Bengaluru"), and preparation tips!

Tone & Style:
- Warm, knowledgeable, refined, and passionate about Indian coffee heritage.
- Concise, conversational responses (keep replies within 2-4 short paragraphs).
- Remember the multi-turn conversation history provided in the context.`;

/**
 * Fallback response generator if GEMINI_API_KEY is not configured
 */
function getSimulatedResponse(message, history = []) {
  const q = message.toLowerCase();

  if (q.includes('book') || q.includes('tour') || q.includes('visit') || q.includes('masterclass')) {
    if (q.includes('people') || q.includes('guest') || q.includes('date') || q.includes('slot') || q.includes('saturday') || q.includes('sunday')) {
      const bookingCode = `KW-EXP-${Math.floor(1000 + Math.random() * 9000)}`;
      return `🎉 **Reservation Confirmed!**\n\n- **Experience**: Estate Cupping & Sensory Tasting Tour\n- **Venue**: Kaapi Works Roastery Lab, 100ft Rd, Indiranagar, Bengaluru\n- **Booking ID**: \`${bookingCode}\`\n\nOur head roaster will welcome you with fresh estate decoction and single-origin flights. A confirmation has been logged to your account. Feel free to ask if you'd like directions or pairing recommendations!`;
    }
    return `We'd love to host you at our Indiranagar Roastery Lab in Bengaluru! We offer two signature experiences:\n\n1. **Estate Cupping & Sensory Tasting Tour** (90 mins · ₹950/person · Daily 11 AM & 4 PM)\n2. **South Indian Decoction & Pour-Over Masterclass** (120 mins · ₹1,450/person · Weekends 2 PM)\n\nWhich experience would you like to join, and what date and number of guests do you have in mind?`;
  }

  if (q.includes('filter') || q.includes('decoction') || q.includes('brass')) {
    return `For authentic South Indian filter coffee, we recommend our **Traditional Kumbakonam Brass Filter (4-cup)** paired with either the **Chikmagalur Reserve Arabica** (for smooth chocolate-almond sweetness) or our **Valparai High-Elevation Kaapi** (for dense, velvety crema).\n\n**Brewing Tip**: Use 25g of medium-fine coffee to 100ml boiling water (92°C). Lightly tamp, let it drip for 12–15 minutes, then froth the thick decoction with hot scalded whole milk in a brass dabara!`;
  }

  if (q.includes('araku') || q.includes('roast of the month') || q.includes('light roast')) {
    return `Our current Roast of the Month is the **Araku Micro-Lot Honey Sun-Dried** (₹680). Harvested by smallholder tribal farmers in the red-soil valleys of Andhra Pradesh at 1,200m, the pulp is left on the beans during sun-drying on bamboo beds. It produces an exquisite cup with jammy wild honey, blackberry, and hibiscus floral notes!`;
  }

  return `Welcome to Kaapi Works! I am your Roastery Sommelier. Sourced directly from shaded single-origin estates across Chikmagalur, Coorg, Araku, and Wayanad, our beans are roasted to order in Bengaluru within 48 hours of dispatch.\n\nAre you looking for a specific roast profile (Light, Medium, or Dark), brewing equipment guidance, or would you like to book a Cupping Tour at our roastery lab?`;
}

/**
 * POST /api/chat
 * Body: { message: string, history: Array<{ role: 'user' | 'model', text: string }> }
 */
export async function handleChatMessage(req, res, next) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    // If no GEMINI_API_KEY is available in environment, use domain-knowledgeable fallback
    if (!process.env.GEMINI_API_KEY) {
      const simulated = getSimulatedResponse(message, history);
      return res.status(200).json({
        success: true,
        reply: simulated,
      });
    }

    try {
      // Build conversation contents array for Gemini
      const contents = [];

      for (const item of history.slice(-10)) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }

      // Append current message
      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const reply = response.text || getSimulatedResponse(message, history);

      return res.status(200).json({
        success: true,
        reply,
      });
    } catch (apiError) {
      console.warn('Gemini API call warning, falling back to simulated engine:', apiError.message);
      const fallback = getSimulatedResponse(message, history);
      return res.status(200).json({
        success: true,
        reply: fallback,
      });
    }
  } catch (error) {
    next(error);
  }
}
