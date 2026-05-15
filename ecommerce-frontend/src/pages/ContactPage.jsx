// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useToast } from '../components/common/ToastNotification';

export default function ContactPage() {
  const showToast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["123 Tech Street", "Lahore, Pakistan 54000"],
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+92 300 1234567", "+92 42 12345678"],
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["support@techhub.com", "sales@techhub.com"],
    },
    {
      icon: "⏰",
      title: "Business Hours",
      details: ["Mon-Fri: 9am - 9pm", "Sat-Sun: 10am - 6pm"],
    },
  ];

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer 30-day hassle-free returns on all products. Items must be in original condition.",
    },
    {
      question: "Do you offer warranty?",
      answer: "Yes, all electronics come with a 24-month warranty. Terms and conditions apply.",
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order from your account dashboard using the tracking number provided.",
    },
  ];

  return (
    <div className="contact-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' }
          ]}
        />

        {/* Page Header */}
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team.</p>
        </div>

        {/* Contact Grid */}
        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-card">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'error' : ''}
                  placeholder="How can we help you?"
                />
                {errors.subject && <span className="error-msg">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error' : ''}
                  rows="6"
                  placeholder="Please describe your inquiry..."
                />
                {errors.message && <span className="error-msg">{errors.message}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info-card">
            <h2>Get in Touch</h2>
            <p>Our team is here to help you with any questions.</p>

            <div className="info-list">
              {contactInfo.map((info, index) => (
                <div key={index} className="info-item">
                  <div className="info-icon">{info.icon}</div>
                  <div className="info-content">
                    <h4>{info.title}</h4>
                    {info.details.map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="social-connect">
              <h4>Connect With Us</h4>
              <div className="social-links-contact">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link fb">📘</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link ig">📷</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link tw">🐦</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link li">🔗</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link yt">🎥</a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h2>Find Us Here</h2>
          <div className="map-placeholder">
            <div className="map-content">
              <span className="map-icon">📍</span>
              <p>123 Tech Street, Lahore, Pakistan</p>
              <small>Interactive map will be integrated here</small>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}