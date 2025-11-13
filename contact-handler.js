// Contact Form Handler - Add this to your HTML pages
class ContactFormHandler {
  constructor(formSelector = '#contactForm', formId = 'contact-form') {
    this.form = document.querySelector(formSelector) || document.getElementById(formId);
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name')?.value || document.querySelector('input[name="name"]')?.value;
    const email = document.getElementById('email')?.value || document.querySelector('input[name="email"]')?.value;
    const subject = document.getElementById('subject')?.value || document.querySelector('input[name="subject"]')?.value;
    const message = document.getElementById('message')?.value || document.querySelector('textarea[name="message"]')?.value;

    // Validate fields
    if (!name || !email || !subject || !message) {
      this.showAlert('Please fill in all fields', 'error');
      return;
    }

    // Validate email format
    if (!this.validateEmail(email)) {
      this.showAlert('Please enter a valid email address', 'error');
      return;
    }

    try {
      // Disable submit button
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Send form data to server
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showAlert('Message sent successfully! We will get back to you soon.', 'success');
        this.form.reset();
      } else {
        this.showAlert(data.error || 'Failed to send message. Please try again.', 'error');
      }

      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

    } catch (error) {
      console.error('Error:', error);
      this.showAlert('An error occurred. Please try again later.', 'error');
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 8px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
      alertDiv.style.backgroundColor = '#10b981';
      alertDiv.style.color = 'white';
    } else if (type === 'error') {
      alertDiv.style.backgroundColor = '#ef4444';
      alertDiv.style.color = 'white';
    } else {
      alertDiv.style.backgroundColor = '#3b82f6';
      alertDiv.style.color = 'white';
    }

    alertDiv.textContent = message;

    // Insert before form
    this.form.parentElement.insertBefore(alertDiv, this.form);

    // Remove alert after 5 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ContactFormHandler('form[action="contact-form.php"]');
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

