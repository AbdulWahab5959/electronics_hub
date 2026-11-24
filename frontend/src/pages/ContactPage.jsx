import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { ChatCircleText } from '@phosphor-icons/react/dist/csr/ChatCircleText';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { Breadcrumb } from '../components/common/Breadcrumb';
import api, { refreshCSRF } from '../services/api';

const blankForm = { name: '', email: '', subject: '', message: '', website: '' };
const location = {
  address: 'Gulberg Chowk, Mianwali',
  region: 'Punjab, Pakistan',
  // Official Google Maps Share > Embed a map URL for the supplied landmark.
  embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3362.0637938525037!2d71.5433188!3d32.5778227!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3927182366506ba7%3A0xa5c4069e3a93e229!2sGulberg%20Chowk!5e0!3m2!1sen!2s!4v1795175438772!5m2!1sen!2s',
  map: 'https://www.google.com/maps/search/?api=1&query=Gulberg%20Chowk%2C%20Mianwali%2C%20Pakistan',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=32.5778227%2C71.5433188',
};

export default function ContactPage() {
  const [form, setForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [reference, setReference] = useState('');
  const formRef = useRef(null);

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: '' }));
    setStatus('');
  }

  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const trimmed = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    const invalid = {};
    for (const key of ['name', 'email', 'subject', 'message']) if (!trimmed[key]) invalid[key] = 'Please complete this field.';
    if (trimmed.message && trimmed.message.length < 10) invalid.message = 'Please include at least 10 characters.';
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      formRef.current?.elements.namedItem(Object.keys(invalid)[0])?.focus(); return;
    }
    pending.current = true; setSubmitting(true); setStatus('');
    try {
      await refreshCSRF();
      const response = await api.post('/contact', trimmed);
      setReference(response.data.reference); setForm(blankForm);
    } catch (error) {
      if (error.response?.status === 422) {
        const validation = Object.fromEntries(Object.entries(error.response.data.errors || {}).map(([key, messages]) => [key, messages[0]]));
        setErrors(validation);
        formRef.current?.elements.namedItem(Object.keys(validation)[0])?.focus();
      }
      setStatus(error.response?.status === 429 ? 'You’ve sent several messages. Please wait a minute before trying again.' : 'Your message could not be sent. Your details are still here; please try again.');
    } finally { pending.current = false; setSubmitting(false); }
  }

  function fieldError(name) {
    return errors[name] ? <span id={`contact-${name}-error`} className="contact-field-error">{errors[name]}</span> : null;
  }

  return <div className="store-contact"><div className="store-contact-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Contact' }]} />
    <header className="store-contact-header">
      <div><p className="contact-eyebrow">TECHHUB CUSTOMER CARE</p><h1>Let’s talk tech.</h1><p>Need help choosing a product, checking an order, or planning a visit? You’re in the right place.</p></div>
      <Link to="/orders" className="contact-order-link"><Package size={23} aria-hidden="true" /><span>Already placed an order?<strong>View your orders</strong></span></Link>
    </header>

    <div className="store-contact-grid">
      <section className="store-contact-form" aria-labelledby="message-heading">
        <div className="contact-section-heading"><span className="contact-section-icon"><ChatCircleText size={23} aria-hidden="true" /></span><div><h2 id="message-heading">Send us a message</h2><p>Tell us what you need help with.</p></div></div>
        {reference ? <div className="contact-success" role="status"><CheckCircle size={40} aria-hidden="true" /><h3>Message received</h3><p>Your message has been saved for the TechHub team.</p><p className="contact-reference">Your reference: <strong>{reference}</strong></p><button type="button" className="contact-button secondary" onClick={() => { setReference(''); setStatus(''); }}>Send another message</button></div> :
          <form ref={formRef} onSubmit={submit} aria-labelledby="message-heading">
            <div className="contact-field-row">
              <div className="contact-field"><label htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label><input id="contact-name" name="name" autoComplete="name" value={form.name} onChange={change} required maxLength={120} disabled={submitting} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} placeholder="Your full name" />{fieldError('name')}</div>
              <div className="contact-field"><label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required maxLength={254} disabled={submitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} placeholder="you@example.com" />{fieldError('email')}</div>
            </div>
            <div className="contact-field"><label htmlFor="contact-subject">Subject <span aria-hidden="true">*</span></label><input id="contact-subject" name="subject" value={form.subject} onChange={change} required maxLength={160} disabled={submitting} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} placeholder="e.g. Laptop availability or an order question" />{fieldError('subject')}</div>
            <div className="contact-field"><label htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows={6} value={form.message} onChange={change} required minLength={10} maxLength={5000} disabled={submitting} aria-invalid={Boolean(errors.message)} aria-describedby={`contact-message-help${errors.message ? ' contact-message-error' : ''}`} placeholder="Include the product name or order reference so we can help." />{fieldError('message')}<div className="contact-message-meta"><span id="contact-message-help">Please don’t include passwords or payment details.</span><span>{form.message.length.toLocaleString()}/5,000</span></div></div>
            <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" autoComplete="off" tabIndex={-1} value={form.website} onChange={change} /></div>
            {status && <p className="contact-submit-error" role="alert">{status}</p>}
            <div className="contact-submit-row"><button type="submit" className="contact-button" disabled={submitting}>{submitting ? 'Sending message…' : 'Send message'}</button><span>Fields marked * are required.</span></div>
          </form>}
      </section>

      <aside className="store-contact-location" aria-labelledby="location-heading">
        <div className="contact-location-heading"><span className="contact-section-icon"><MapPin size={23} aria-hidden="true" /></span><div><h2 id="location-heading">Find us in Mianwali</h2><p>Gulberg Chowk</p></div></div>
        <div className="contact-map-frame"><iframe src={location.embed} title="Google Maps: Gulberg Chowk, Mianwali, Pakistan" width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
        <div className="contact-map-address"><address><strong>{location.address}</strong><span>{location.region}</span></address><a href={location.directions} target="_blank" rel="noopener noreferrer" className="contact-button">Get directions</a><a className="contact-map-link" href={location.map} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></div>
        <p className="contact-visit-note">The map shows the Gulberg Chowk landmark. Message us to confirm product availability before your visit.</p>
      </aside>
    </div>

    <section className="contact-help-section" aria-labelledby="help-heading">
      <div><p className="contact-eyebrow">A LITTLE HELP, BEFORE YOU ASK</p><h2 id="help-heading">Good to know</h2><p>Quick answers for your next purchase.</p><Link to="/shop">Explore the shop</Link></div>
      <div className="contact-help-list">
        <details><summary>Where can I check my order?</summary><p>Sign in and open <Link to="/orders">your orders</Link> to view the order details and current status. Include your order reference if you need help.</p></details>
        <details><summary>How much will delivery cost?</summary><p>Shipping charges and the final total are confirmed at checkout before you place your order.</p></details>
        <details><summary>Can I check availability before visiting?</summary><p>Yes. Send us the product name using the form above. The product page also shows current stock, which is checked again when you add it to your cart.</p></details>
        <details><summary>How do I ask about a return or warranty?</summary><p>Send us your order reference, product name, and a description of the issue. Ask the team to confirm the applicable terms before arranging a return.</p></details>
      </div>
    </section>
  </div></div>;
}
