export default function Loading() {
    return (
        <div
            aria-live="polite"
            aria-busy="true"
            style={{
                minHeight: '60vh',
                background: 'var(--cdrl-black)',
                color: 'var(--cdrl-text-light)',
                display: 'grid',
                placeItems: 'center',
                padding: '80px 24px',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div
                    aria-hidden="true"
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        border: '3px solid rgba(112,242,80,0.25)',
                        borderTopColor: 'var(--cdrl-green)',
                        margin: '0 auto 18px',
                        animation: 'cdrlSpin 900ms linear infinite',
                    }}
                />
                <span
                    style={{
                        fontSize: 11,
                        letterSpacing: '0.17em',
                        color: 'var(--cdrl-green)',
                        fontWeight: 700,
                    }}
                >
                    LOADING
                </span>
            </div>
            <style>{`@keyframes cdrlSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}