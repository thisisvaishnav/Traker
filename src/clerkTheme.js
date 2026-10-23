export const clerkParchmentTheme = {
  variables: {
    colorPrimary: '#8c2b22', // seal wax red
    colorText: '#1d1812', // iron gall ink
    colorTextSecondary: '#7a6648',
    colorBackground: '#e9dcbd',
    colorInputBackground: 'rgba(230, 215, 180, 0.45)',
    colorInputText: '#1f2a4a',
    fontFamily: '"EB Garamond", Georgia, serif',
    borderRadius: '3px',
  },
  elements: {
    rootBox: {
      fontFamily: '"EB Garamond", Georgia, serif',
    },
    card: {
      backgroundColor: '#e9dcbd',
      backgroundImage:
        'radial-gradient(ellipse at 15% 10%, rgba(160, 115, 45, 0.22), transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(130, 85, 30, 0.24), transparent 50%), #e9dcbd',
      border: '1px solid rgba(100, 70, 25, 0.45)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(85, 55, 18, 0.25)',
      color: '#1d1812',
      borderRadius: '4px',
    },
    headerTitle: {
      fontFamily: '"IM Fell English", Georgia, serif',
      fontSize: '28px',
      color: '#1d1812',
      fontWeight: '400',
    },
    headerSubtitle: {
      fontFamily: '"EB Garamond", Georgia, serif',
      fontStyle: 'italic',
      color: '#7a6648',
      fontSize: '17px',
    },
    formButtonPrimary: {
      backgroundColor: '#1d1812',
      color: '#e9dcbd',
      fontFamily: '"EB Garamond", serif',
      fontSize: '18px',
      fontStyle: 'italic',
      border: '1px solid #1d1812',
      borderRadius: '2px',
      padding: '10px 18px',
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: '#8c2b22',
        borderColor: '#8c2b22',
        color: '#fcf8ec',
      },
    },
    formFieldLabel: {
      fontFamily: '"EB Garamond", serif',
      fontStyle: 'italic',
      fontSize: '16px',
      color: '#1d1812',
    },
    formFieldInput: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(122, 102, 72, 0.6)',
      borderBottomWidth: '2px',
      borderRadius: '2px',
      fontFamily: '"Caveat", cursive',
      fontSize: '22px',
      color: '#1f2a4a',
      '&:focus': {
        borderColor: '#8c2b22',
        boxShadow: 'none',
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(230, 215, 180, 0.4)',
      border: '1px solid rgba(122, 102, 72, 0.5)',
      color: '#1d1812',
      fontFamily: '"EB Garamond", serif',
      fontSize: '16px',
      '&:hover': {
        backgroundColor: 'rgba(230, 215, 180, 0.8)',
        borderColor: '#1d1812',
      },
    },
    socialButtonsBlockButtonText: {
      color: '#1d1812',
      fontFamily: '"EB Garamond", serif',
    },
    footerActionText: {
      color: '#7a6648',
      fontStyle: 'italic',
    },
    footerActionLink: {
      color: '#8c2b22',
      fontStyle: 'italic',
      textDecoration: 'underline',
      '&:hover': {
        color: '#1d1812',
      },
    },
    dividerLine: {
      backgroundColor: 'rgba(122, 102, 72, 0.35)',
    },
    dividerText: {
      color: '#7a6648',
      fontStyle: 'italic',
    },
    userButtonBox: {
      border: '1px solid rgba(100, 70, 25, 0.35)',
      borderRadius: '50%',
      padding: '2px',
    },
    userButtonPopoverCard: {
      backgroundColor: '#e9dcbd',
      backgroundImage:
        'radial-gradient(ellipse at 15% 10%, rgba(160, 115, 45, 0.2), transparent 50%), #e9dcbd',
      border: '1px solid rgba(100, 70, 25, 0.45)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
      color: '#1d1812',
    },
    userPreviewMainIdentifier: {
      fontFamily: '"IM Fell English", serif',
      color: '#1d1812',
      fontSize: '18px',
    },
    userPreviewSecondaryIdentifier: {
      fontFamily: '"EB Garamond", serif',
      fontStyle: 'italic',
      color: '#7a6648',
    },
    userButtonPopoverActionButton: {
      color: '#1d1812',
      fontFamily: '"EB Garamond", serif',
      '&:hover': {
        backgroundColor: 'rgba(140, 43, 34, 0.1)',
        color: '#8c2b22',
      },
    },
    userButtonPopoverActionButtonText: {
      color: '#1d1812',
      fontFamily: '"EB Garamond", serif',
    },
    userButtonPopoverFooter: {
      borderTop: '1px solid rgba(122, 102, 72, 0.35)',
    },
  },
};
