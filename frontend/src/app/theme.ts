import { alpha, createTheme } from '@mui/material/styles'

// Bölüm 13.2: "Sade, modern, kurumsal bir İK platformu görünümü" — tüm renk/
// tipografi/şekil kararları YALNIZCA burada verilir; component'ler bu
// token'ları tüketir, kendi renk/boyut sabitini TANIMLAMAZ.

const palette = {
  primary: {
    main: '#1E3A5F',
    light: '#3F5C82',
    dark: '#132842',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F4F6F9',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A2233',
    secondary: '#5B6472',
  },
  divider: '#E3E8EF',
} as const

// MUI'nin varsayılan xs/sm/md/lg/xl breakpoint'leri AYNEN kullanılıyor
// (bkz. 05-frontend-roadmap.md Bölüm 2.1) — özel bir breakpoint sistemi
// icat edilmiyor, bu yüzden burada override YOK.
export const theme = createTheme({
  palette,
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: -0.3 },
    h5: { fontWeight: 600, letterSpacing: -0.2 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.background.default },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none' },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.background.paper,
          borderRight: `1px solid ${palette.divider}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.1),
            color: palette.primary.main,
            '& .MuiListItemIcon-root': { color: palette.primary.main },
            '&:hover': { backgroundColor: alpha(palette.primary.main, 0.16) },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: palette.text.secondary },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          borderTop: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: palette.text.secondary,
          '&.Mui-selected': { color: palette.primary.main },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem' },
      },
    },
  },
})
