import CookieConsent from 'react-cookie-consent';

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="אני מסכים"
      declineButtonText="דחייה"
      cookieName="hamodia_cookie_consent"
      style={{
        background: '#1a1a2e',
        padding: '16px 24px',
        alignItems: 'center',
        direction: 'rtl',
        gap: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}
      buttonStyle={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#9ca3af',
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        marginLeft: '12px'
      }}
      contentStyle={{
        flex: '1 0 300px',
        margin: '0',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#e5e7eb'
      }}
      expires={365}
      enableDeclineButton
      onAccept={() => {
        console.log('User accepted cookies');
      }}
      onDecline={() => {
        console.log('User declined cookies');
      }}>

      <span data-ev-id="ev_9877f205c5" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span data-ev-id="ev_e777958283" style={{ fontSize: '20px' }}>🍪</span>
        <span data-ev-id="ev_c13bc3f280">
          אתר זה משתמש בעוגיות (cookies) לשיפור חווית הגלישה, ניתוח תנועה ולהתאמה אישית של תוכן.
          על ידי לחיצה על "אני מסכים" אתם מאשרים את השימוש בעוגיות.
          <a data-ev-id="ev_f5e5ee9335"
          href="/privacy-policy"
          style={{
            color: '#667eea',
            textDecoration: 'underline',
            marginRight: '8px'
          }}>

            מדיניות פרטיות
          </a>
        </span>
      </span>
    </CookieConsent>);

}