import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        background: '#0B0B0F',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      {/* Big number */}
      <p
        style={{
          fontSize: '120px',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #7B61FF, #3ECFFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          letterSpacing: '-4px',
        }}
      >
        404
      </p>

      <h1
        style={{
          fontWeight: 900,
          fontSize: '24px',
          marginBottom: '8px',
          color: '#fff',
        }}
      >
        ไม่เจอหน้าที่ต้องการ
      </h1>
      <p
        style={{
          color: 'rgba(255,255,255,0.38)',
          fontSize: '15px',
          marginBottom: '40px',
          maxWidth: '320px',
          lineHeight: 1.6,
        }}
      >
        อาจถูกย้ายหรือลบแล้ว — กลับหน้าแรกแล้วเริ่มวิเคราะห์ใหม่ได้เลยค่ะ
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: '52px',
          padding: '0 28px',
          borderRadius: '16px',
          background: '#FF9F1C',
          color: '#000',
          fontWeight: 900,
          fontSize: '15px',
          textDecoration: 'none',
        }}
      >
        กลับหน้าแรก →
      </Link>

      <p
        style={{
          marginTop: '48px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.18)',
        }}
      >
        <span
          style={{
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
          }}
        >
          MITA+
        </span>
        {' '}— Money In The Air
      </p>
    </main>
  )
}
