/**
 * WhatsApp Cloud API Integration (Meta Business Platform)
 *
 * Environment variables required:
 *   WHATSAPP_PHONE_NUMBER_ID  – Your WhatsApp Business phone number ID
 *   WHATSAPP_ACCESS_TOKEN     – Permanent access token from Meta
 *   WHATSAPP_ENABLED          – Set to "true" to enable sending (default: false)
 *
 * Free tier: 1,000 service conversations/month
 * Utility messages (alerts/reminders): ₹0.30 per conversation
 */

const WA_API_URL = 'https://graph.facebook.com/v21.0';

const isEnabled = () => process.env.WHATSAPP_ENABLED === 'true';

/**
 * Send a plain text WhatsApp message.
 * @param {string} to   – Recipient phone number with country code (e.g. "919876543210")
 * @param {string} text – Message body
 */
export const sendWhatsAppText = async (to, text) => {
  if (!isEnabled()) return null;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp credentials not configured');
    return null;
  }

  // Strip non-digits and ensure country code
  const cleanPhone = to.replace(/\D/g, '');

  const res = await fetch(`${WA_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: { body: text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('WhatsApp send failed:', data);
  }
  return data;
};

/**
 * Send a WhatsApp template message (required for business-initiated conversations).
 * @param {string} to             – Recipient phone with country code
 * @param {string} templateName   – Pre-approved template name
 * @param {string} languageCode   – e.g. "en"
 * @param {Array}  bodyParams     – Array of parameter strings for the template body
 */
export const sendWhatsAppTemplate = async (to, templateName, languageCode = 'en', bodyParams = []) => {
  if (!isEnabled()) return null;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp credentials not configured');
    return null;
  }

  const cleanPhone = to.replace(/\D/g, '');

  const components = [];
  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((p) => ({ type: 'text', text: String(p) })),
    });
  }

  const res = await fetch(`${WA_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('WhatsApp template send failed:', data);
  }
  return data;
};

/**
 * Send WhatsApp messages to multiple recipients (fire-and-forget).
 * Adds a 100ms delay between messages to avoid rate limiting.
 * @param {Array<{phone: string, message: string}>} recipients
 */
export const sendWhatsAppBulk = async (recipients) => {
  if (!isEnabled() || !recipients || recipients.length === 0) return;

  for (const { phone, message } of recipients) {
    try {
      await sendWhatsAppText(phone, message);
      // Small delay to avoid hitting rate limits
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`WhatsApp bulk send failed for ${phone}:`, err.message);
    }
  }
};

/**
 * Helper: Get parent phone numbers for a list of student IDs.
 * Returns array of { phone, parentName, studentName }
 */
export const getParentPhones = async (Student, Parent, studentIds) => {
  const students = await Student.find({ _id: { $in: studentIds } })
    .populate('userId', 'name')
    .select('parentId userId');

  const parentIds = [...new Set(students.map((s) => s.parentId).filter(Boolean).map(String))];
  if (parentIds.length === 0) return [];

  const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId', 'name phone');

  // Build a map: parentId → { phone, parentName }
  const parentMap = {};
  for (const p of parents) {
    if (p.userId?.phone) {
      parentMap[String(p._id)] = {
        phone: p.userId.phone,
        parentName: p.userId.name || 'Parent',
      };
    }
  }

  // Map students to their parent phones
  return students
    .filter((s) => s.parentId && parentMap[String(s.parentId)])
    .map((s) => ({
      phone: parentMap[String(s.parentId)].phone,
      parentName: parentMap[String(s.parentId)].parentName,
      studentName: s.userId?.name || 'Student',
      studentId: s._id,
    }));
};
