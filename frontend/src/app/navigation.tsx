import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import PollOutlinedIcon from '@mui/icons-material/PollOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import type { ReactElement } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../modules/auth/ProtectedRoute'
import { ProfilePage } from '../modules/auth/pages/ProfilePage'
import { UserRolesPage } from '../modules/auth/pages/UserRolesPage'
import { UsersListPage } from '../modules/auth/pages/UsersListPage'
import { AuditLogPage } from '../modules/audit/pages/AuditLogPage'
import { LeaveApprovalsPage } from '../modules/leave/pages/LeaveApprovalsPage'
import { LeaveBalancePage } from '../modules/leave/pages/LeaveBalancePage'
import { LeaveRequestFormPage } from '../modules/leave/pages/LeaveRequestFormPage'
import { LeaveRequestsPage } from '../modules/leave/pages/LeaveRequestsPage'
import { LeaveTypesPage } from '../modules/leave/pages/LeaveTypesPage'
import { EmployeeCreatePage } from '../modules/organization/pages/EmployeeCreatePage'
import { EmployeeDetailPage } from '../modules/organization/pages/EmployeeDetailPage'
import { EmployeesListPage } from '../modules/organization/pages/EmployeesListPage'
import { JobDescriptionsPage } from '../modules/organization/pages/JobDescriptionsPage'
import { JobTitlesPage } from '../modules/organization/pages/JobTitlesPage'
import { OrganizationChartPage } from '../modules/organization/pages/OrganizationChartPage'
import { OrganizationLayout } from '../modules/organization/pages/OrganizationLayout'
import { PolicyDocumentsPage } from '../modules/organization/pages/PolicyDocumentsPage'
import { UnitsPage } from '../modules/organization/pages/UnitsPage'
import { CandidateDetailPage } from '../modules/recruitment/pages/CandidateDetailPage'
import { CandidatesPage } from '../modules/recruitment/pages/CandidatesPage'
import { AttendanceDeviationsPage } from '../modules/attendance/pages/AttendanceDeviationsPage'
import { AttendanceRecordsPage } from '../modules/attendance/pages/AttendanceRecordsPage'
import { TimesheetPage } from '../modules/attendance/pages/TimesheetPage'
import { WorkModelAssignmentPage } from '../modules/attendance/pages/WorkModelAssignmentPage'
import { WorkModelsPage } from '../modules/attendance/pages/WorkModelsPage'
import { AwardsPage } from '../modules/discipline/pages/AwardsPage'
import { DisciplinaryCaseDetailPage } from '../modules/discipline/pages/DisciplinaryCaseDetailPage'
import { DisciplinaryCasesPage } from '../modules/discipline/pages/DisciplinaryCasesPage'
import { WarningsPage } from '../modules/discipline/pages/WarningsPage'
import { AppointmentBookingPage } from '../modules/amenities/pages/AppointmentBookingPage'
import { AppointmentNotesPage } from '../modules/amenities/pages/AppointmentNotesPage'
import { ClubDetailPage } from '../modules/amenities/pages/ClubDetailPage'
import { ClubMembershipRequestsPage } from '../modules/amenities/pages/ClubMembershipRequestsPage'
import { ClubsManagePage } from '../modules/amenities/pages/ClubsManagePage'
import { ClubsPage } from '../modules/amenities/pages/ClubsPage'
import { ServiceOfferingsPage } from '../modules/amenities/pages/ServiceOfferingsPage'
import { MySuggestionsPage } from '../modules/feedback/pages/MySuggestionsPage'
import { SuggestionCategoriesPage } from '../modules/feedback/pages/SuggestionCategoriesPage'
import { SuggestionsManagePage } from '../modules/feedback/pages/SuggestionsManagePage'
import { SurveyAnswerPage } from '../modules/feedback/pages/SurveyAnswerPage'
import { SurveyResultsPage } from '../modules/feedback/pages/SurveyResultsPage'
import { SurveysPage } from '../modules/feedback/pages/SurveysPage'
import { TravelRequestDetailPage } from '../modules/travel/pages/TravelRequestDetailPage'
import { TravelRequestsPage } from '../modules/travel/pages/TravelRequestsPage'
import { MyTrainingsPage } from '../modules/training/pages/MyTrainingsPage'
import { TrainingApprovalsPage } from '../modules/training/pages/TrainingApprovalsPage'
import { TrainingCatalogPage } from '../modules/training/pages/TrainingCatalogPage'
import { TrainingCompletedPage } from '../modules/training/pages/TrainingCompletedPage'
import { HiringRequestFormPage } from '../modules/recruitment/pages/HiringRequestFormPage'
import { HiringRequestsPage } from '../modules/recruitment/pages/HiringRequestsPage'
import { StaffingNormsPage } from '../modules/recruitment/pages/StaffingNormsPage'
import { CompetenciesPage } from '../modules/performance/pages/CompetenciesPage'
import { GoalsPage } from '../modules/performance/pages/GoalsPage'
import { MyPerformanceResultsRedirect } from '../modules/performance/pages/MyPerformanceResultsRedirect'
import { PerformanceResultsPage } from '../modules/performance/pages/PerformanceResultsPage'
import { PerformanceSettingsLayout } from '../modules/performance/pages/PerformanceSettingsLayout'
import { RatingScaleSettingsPage } from '../modules/performance/pages/RatingScaleSettingsPage'
import { SelfAssessmentPage } from '../modules/performance/pages/SelfAssessmentPage'
import { TeamAssessmentsPage } from '../modules/performance/pages/TeamAssessmentsPage'
import { Forbidden } from './Forbidden'
import { HomePlaceholder } from './HomePlaceholder'

// Menü yeniden düzenlemesi (13.2 revizyonu): masaüstü/tablet menüsü bu 6
// SABİT grup altında toplanır (bkz. Sidebar/GroupedNavList) — sıra burada
// TANIMLIDIR ve menüde gösterilecek sıraya BİREBİR karşılık gelir.
export const NAV_GROUPS = [
  'Genel',
  'Organizasyon',
  'Çalışan İşlemleri',
  'İK Süreçleri',
  'Çalışan Deneyimi',
  'Yönetim',
] as const

export type NavGroup = (typeof NAV_GROUPS)[number]

export type NavItem = {
  label: string
  path: string
  icon: ReactElement
  group: NavGroup
  // undefined => oturum açmış HER rol görür. Bölüm 4.4: bu yalnızca görsel
  // bir filtredir, gerçek yetkilendirme her zaman backend'de uygulanır.
  roles?: string[]
}

export type RouteHandle = {
  // TopBar'daki sayfa başlığı (bkz. TopBar.tsx usePageTitle).
  title: string
  // Menüde GÖRÜNMESİ gereken route'lar bunu taşır; menüde YER ALMAMASI
  // gereken route'lar (ör. detay/düzenleme sayfaları) OMİT eder.
  nav?: Omit<NavItem, 'path'>
}

type AppRoute = RouteObject & {
  path: string
  handle: RouteHandle
}

// Bölüm 13.3: "Menü veri yapısı ... route tanımının kendisinden otomatik
// türetilmesi hedeflenir, elle iki kez yazılmaz." — bu liste hem router.tsx'in
// hem de menünün TEK ortak kaynağıdır; yeni bir modül route'u eklemek otomatik
// olarak menüye de ekler (ayrı bir menuConfig İCAT EDİLMEDİ).
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <HomePlaceholder />,
    handle: { title: 'Ana Sayfa', nav: { group: 'Genel', label: 'Ana Sayfa', icon: <HomeOutlinedIcon /> } },
  },
  {
    path: '/organization',
    // Bölüm 13.7: üst seviyede yalnızca "oturum açmış olma" gerekir —
    // ADMIN/IK kısıtı artık TEK TEK admin-only alt route'larda (aşağıda).
    // `employees/:id` KASITLI OLARAK BURADA KISITLANMAZ: roadmap'in kabul
    // kriteri "çalışan yalnızca kendi kaydını (self-servis, salt-okunur)
    // görebilir" — bu, backend'in `EmployeeAccessGuard.isSelf` kontrolüyle
    // (GÖRSEL değil, GERÇEK) uygulanır; başka bir kaydı görüntüleme denemesi
    // backend'den 403 döner (bkz. EmployeeDetailPage'in forbidden durumu).
    element: (
      <ProtectedRoute>
        <OrganizationLayout />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Organizasyon',
      nav: { group: 'Organizasyon', label: 'Organizasyon', icon: <ApartmentOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
    children: [
      { index: true, element: <Navigate to="units" replace /> },
      {
        path: 'units',
        element: (
          <ProtectedRoute roles={['ADMIN', 'IK']}>
            <UnitsPage />
          </ProtectedRoute>
        ),
        handle: { title: 'Organizasyon Birimleri' },
      },
      {
        path: 'job-titles',
        element: (
          <ProtectedRoute roles={['ADMIN', 'IK']}>
            <JobTitlesPage />
          </ProtectedRoute>
        ),
        handle: { title: 'Unvanlar' },
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute roles={['ADMIN', 'IK']}>
            <EmployeesListPage />
          </ProtectedRoute>
        ),
        // Menü yeniden düzenlemesi (13.2 revizyonu): önceden bu route'un
        // yalnızca `OrganizationLayout`'un sabit sekme çubuğundan ulaşılabilir
        // olması (bkz. o dosya) BottomNav'ın "Çalışanlar" kısayolu için
        // doğrudan bir menü girişi de gerektirdi — route/rol/element AYNI,
        // yalnızca menüde GÖRÜNÜRLÜK eklendi.
        handle: {
          title: 'Çalışanlar',
          nav: { group: 'Organizasyon', label: 'Çalışanlar', icon: <BadgeOutlinedIcon />, roles: ['ADMIN', 'IK'] },
        },
      },
      {
        path: 'employees/new',
        element: (
          <ProtectedRoute roles={['ADMIN', 'IK']}>
            <EmployeeCreatePage />
          </ProtectedRoute>
        ),
        handle: { title: 'Yeni Çalışan' },
      },
      { path: 'employees/:id', element: <EmployeeDetailPage />, handle: { title: 'Çalışan Detayı' } },
    ],
  },
  {
    // Bölüm 14.3 (US-04.1.1): İzin türleri referans listesi — backend'de
    // rol kısıtı YOK (bkz. LeaveTypeController javadoc), ama frontend'de
    // organization'daki AYNI emsalle ADMIN/IK'ya GÖRSEL olarak kısıtlanır.
    path: '/leave/types',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <LeaveTypesPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'İzin Türleri',
      nav: { group: 'İK Süreçleri', label: 'İzin Türleri', icon: <CategoryOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // Herkes (oturumlu) kendi bakiyesini görür — `employeeId`, `useMyEmployee`
    // ile çözülür (bkz. LeaveBalancePage'in KENDİ boş-durum notu).
    path: '/leave/balance',
    element: (
      <ProtectedRoute>
        <LeaveBalancePage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'İzin Bakiyem',
      nav: { group: 'Çalışan İşlemleri', label: 'İzin Bakiyem', icon: <AccountBalanceWalletOutlinedIcon /> },
    },
  },
  {
    path: '/leave/requests',
    element: (
      <ProtectedRoute>
        <LeaveRequestsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'İzin Taleplerim',
      nav: { group: 'Çalışan İşlemleri', label: 'İzin Taleplerim', icon: <EventAvailableOutlinedIcon /> },
    },
  },
  {
    path: '/leave/requests/new',
    element: (
      <ProtectedRoute>
        <LeaveRequestFormPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Yeni İzin Talebi' },
  },
  {
    // Roadmap'in kendi rol tablosu: yalnızca YONETICI. ADMIN/IK de backend'de
    // karar verebilir (@PreAuthorize) ama bu SAYFAYA roadmap'in tasarımı
    // GEREĞİ yönlendirilmez — GÖRSEL bir sınır (bkz. Bölüm 4.4).
    path: '/leave/approvals',
    element: (
      <ProtectedRoute roles={['YONETICI']}>
        <LeaveApprovalsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Onay Bekleyenler',
      nav: { group: 'İK Süreçleri', label: 'Onay Bekleyenler', icon: <FactCheckOutlinedIcon />, roles: ['YONETICI'] },
    },
  },
  {
    // US-05.1.1: Norm kadro tanımlama — backend'de rol kısıtı YOK (bkz.
    // StaffingNormController javadoc, JobTitleController'daki AYNI emsal),
    // frontend'de ADMIN/IK'ya GÖRSEL olarak kısıtlanır (leave/types'daki
    // AYNI desen).
    path: '/recruitment/staffing-norms',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <StaffingNormsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Norm Kadrolar',
      nav: { group: 'İK Süreçleri', label: 'Norm Kadrolar', icon: <AssignmentIndOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-05.2.1/US-05.2.2: aday listesi/detayı — CV/kişisel veri içerdiğinden
    // backend'de YENİ eklenen okuma uçları @PreAuthorize("hasAnyRole('ADMIN','IK')")
    // (bkz. CandidateController'daki 14.4 notu) — frontend AYNI kısıtı yansıtır.
    path: '/recruitment/candidates',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <CandidatesPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Adaylar',
      nav: { group: 'İK Süreçleri', label: 'Adaylar', icon: <PersonSearchOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    path: '/recruitment/candidates/:id',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <CandidateDetailPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Aday Detayı' },
  },
  {
    // US-05.3.1: roadmap'in rol tablosu — yalnızca YONETICI talep oluşturur.
    path: '/recruitment/hiring-requests/new',
    element: (
      <ProtectedRoute roles={['YONETICI']}>
        <HiringRequestFormPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Yeni İşe Alım Talebi' },
  },
  {
    // US-05.3.2: roadmap'in rol tablosu — "YONETICI (1. adım), İK (2. adım)"
    // AYNI EKRAN için İKİ rol; `HiringRequestsPage` kendi İÇİNDE role göre
    // ayrı bir görünüm seçer (bkz. o dosyadaki not) — `leave/approvals`'ın
    // AKSİNE (tek rol, tek görünüm) burada ADMIN de dahil (backend
    // hr-decision zaten ADMIN/IK'yı yetkilendiriyor).
    path: '/recruitment/hiring-requests',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK', 'YONETICI']}>
        <HiringRequestsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'İşe Alım Talepleri',
      nav: { group: 'İK Süreçleri', label: 'İşe Alım Talepleri', icon: <WorkOutlineOutlinedIcon />, roles: ['ADMIN', 'IK', 'YONETICI'] },
    },
  },
  {
    // US-06.1.1/US-06.1.2/US-06.2.3: Hedefler/Yetkinlikler/Puanlama ayarları
    // — `organization.OrganizationLayout`'daki AYNI desen (bkz. o dosyanın
    // gerekçesi), TEK "Performans Ayarları" menü girişi, ÜÇ sekme/route.
    path: '/performance',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <PerformanceSettingsLayout />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Performans Ayarları',
      nav: { group: 'İK Süreçleri', label: 'Performans Ayarları', icon: <TrackChangesOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
    children: [
      { index: true, element: <Navigate to="goals" replace /> },
      { path: 'goals', element: <GoalsPage />, handle: { title: 'Hedefler' } },
      { path: 'competencies', element: <CompetenciesPage />, handle: { title: 'Yetkinlikler' } },
      { path: 'rating-scale', element: <RatingScaleSettingsPage />, handle: { title: 'Puanlama ve Ağırlıklandırma' } },
    ],
  },
  {
    // US-06.2.1: Herkes (oturumlu) kendi öz değerlendirmesini yapar —
    // `employeeId`, `useMyEmployee` ile çözülür (leave/balance'daki AYNI desen).
    path: '/performance/self-assessment',
    element: (
      <ProtectedRoute>
        <SelfAssessmentPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Öz Değerlendirme',
      nav: { group: 'Çalışan İşlemleri', label: 'Öz Değerlendirme', icon: <RateReviewOutlinedIcon /> },
    },
  },
  {
    // US-06.2.2: roadmap'in rol tablosu — yalnızca YONETICI.
    path: '/performance/team-assessments',
    element: (
      <ProtectedRoute roles={['YONETICI']}>
        <TeamAssessmentsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Ekip Değerlendirmeleri',
      nav: { group: 'İK Süreçleri', label: 'Ekip Değerlendirmeleri', icon: <SupervisorAccountOutlinedIcon />, roles: ['YONETICI'] },
    },
  },
  {
    // US-06.3.1: "Herkes (kendi)" — kendi id'sine yönlendiren KISA yol
    // (bkz. MyPerformanceResultsRedirect'teki not).
    path: '/performance/results/me',
    element: (
      <ProtectedRoute>
        <MyPerformanceResultsRedirect />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Performans Sonuçlarım',
      nav: { group: 'Çalışan İşlemleri', label: 'Performans Sonuçlarım', icon: <TrendingUpOutlinedIcon /> },
    },
  },
  {
    // US-06.3.1: "Herkes (kendi) / YONETICI (ekibi)" — backend bu uçlarda
    // rol kısıtı UYGULAMADIĞINDAN (bkz. sayfanın KENDİ dosyasındaki not)
    // frontend'de de rota seviyesinde GÖRSEL bir kısıt EKLENMEZ; nav girişi
    // YOK, `/results/me` kısa yolundan veya `TeamAssessmentsPage`'in
    // gönderim sonrası yönlendirmesinden ulaşılır.
    path: '/performance/results/:employeeId',
    element: (
      <ProtectedRoute>
        <PerformanceResultsPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Performans Sonuçları' },
  },
  {
    // US-07.1.1: Çalışma modeli referans listesi CRUD — backend'de rol
    // kısıtı YOK, frontend'de ADMIN/IK'ya GÖRSEL olarak kısıtlanır.
    path: '/attendance/work-models',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <WorkModelsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Çalışma Modelleri',
      nav: { group: 'İK Süreçleri', label: 'Çalışma Modelleri', icon: <ScheduleOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-07.1.2: nav girişi YOK — `organization.EmployeeDetailPage`'deki
    // bir bağlantıyla ulaşılır (bkz. o sayfadaki 14.6 notu).
    path: '/attendance/employees/:id/work-model',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <WorkModelAssignmentPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Çalışma Modeli Ataması' },
  },
  {
    // US-07.2.1: roadmap'in kendi notu — "bu ekran YALNIZCA GÖRÜNTÜLER."
    path: '/attendance/records',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <AttendanceRecordsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Devam Kayıtları',
      nav: { group: 'İK Süreçleri', label: 'Devam Kayıtları', icon: <EventNoteOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    path: '/attendance/deviations',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <AttendanceDeviationsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Vardiya Sapmaları',
      nav: { group: 'İK Süreçleri', label: 'Vardiya Sapmaları', icon: <WarningAmberOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-07.3.1: "ADMIN, IK (+ kendi puantajı: CALISAN)" — TEK route, HERKESE
    // açık; `TimesheetPage` KENDİ İÇİNDE role göre görünüm seçer (bkz. o
    // sayfadaki not, `HiringRequestsPage`'deki (14.4) AYNI "tek route, rol
    // bazlı iç görünüm" deseni).
    path: '/attendance/timesheet',
    element: (
      <ProtectedRoute>
        <TimesheetPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Puantaj',
      nav: { group: 'Çalışan İşlemleri', label: 'Puantaj', icon: <CalendarMonthOutlinedIcon /> },
    },
  },
  {
    // US-08A.1.1: Eğitim kataloğu CRUD — backend'de rol kısıtı YOK,
    // frontend'de ADMIN/IK'ya GÖRSEL olarak kısıtlanır.
    path: '/training/catalog',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <TrainingCatalogPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Eğitim Kataloğu',
      nav: { group: 'İK Süreçleri', label: 'Eğitim Kataloğu', icon: <SchoolOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08A.1.2: Herkes (oturumlu) kendi eğitim taleplerini yönetir.
    path: '/training/my-trainings',
    element: (
      <ProtectedRoute>
        <MyTrainingsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Eğitimlerim',
      nav: { group: 'Çalışan İşlemleri', label: 'Eğitimlerim', icon: <MenuBookOutlinedIcon /> },
    },
  },
  {
    // US-08A.1.2: "Talep, yöneticiye onaya gider" — roadmap'in rol tablosu
    // burada AÇIKÇA belirtilmiyor ama `leave/approvals`'daki AYNI emsalle
    // (onay = YONETICI) kısıtlandı.
    path: '/training/approvals',
    element: (
      <ProtectedRoute roles={['YONETICI']}>
        <TrainingApprovalsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Eğitim Onayları',
      nav: { group: 'İK Süreçleri', label: 'Eğitim Onayları', icon: <HowToRegOutlinedIcon />, roles: ['YONETICI'] },
    },
  },
  {
    // US-08A.1.3: "İK kullanıcısı olarak ... görmek istiyorum."
    path: '/training/completed',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <TrainingCompletedPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Tamamlanan Eğitimler',
      nav: { group: 'İK Süreçleri', label: 'Tamamlanan Eğitimler', icon: <TaskAltOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08B.1.1: Herkes (oturumlu) kendi seyahat taleplerini yönetir;
    // ADMIN/IK/YONETICI ek olarak başka çalışanları GÖRÜNTÜLEYEBİLİR (bkz.
    // sayfanın KENDİ dosyasındaki not).
    path: '/travel/requests',
    element: (
      <ProtectedRoute>
        <TravelRequestsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Seyahat Taleplerim',
      nav: { group: 'Çalışan İşlemleri', label: 'Seyahat Taleplerim', icon: <FlightTakeoffOutlinedIcon /> },
    },
  },
  {
    // US-08B.1.2/US-08B.1.3: nav girişi YOK, `/travel/requests` listesinden
    // ulaşılır — masraf onayı (YONETICI) rolü sayfanın KENDİ İÇİNDE kontrol
    // edilir (backend'de rol kısıtı YOK, bkz. ExpenseItemController javadoc'u).
    path: '/travel/requests/:id',
    element: (
      <ProtectedRoute>
        <TravelRequestDetailPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Seyahat Talebi Detayı' },
  },
  {
    // US-08C.1.1: Uyarı kaydı oluşturma/listeleme — backend'de rol kısıtı
    // YOK, frontend'de ADMIN/IK'ya GÖRSEL olarak kısıtlanır.
    path: '/discipline/warnings',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <WarningsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Uyarı Kayıtları',
      nav: { group: 'İK Süreçleri', label: 'Uyarı Kayıtları', icon: <ReportProblemOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08C.1.2/US-08C.1.3: Ceza süreçleri.
    path: '/discipline/cases',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <DisciplinaryCasesPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Ceza Süreçleri',
      nav: { group: 'İK Süreçleri', label: 'Ceza Süreçleri', icon: <GavelOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    path: '/discipline/cases/:id',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <DisciplinaryCaseDetailPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Ceza Süreci Detayı' },
  },
  {
    // US-08C.1.4: roadmap'in rol tablosu — YONETICI, ADMIN, IK.
    path: '/discipline/awards',
    element: (
      <ProtectedRoute roles={['YONETICI', 'ADMIN', 'IK']}>
        <AwardsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Ödül Kayıtları',
      nav: { group: 'İK Süreçleri', label: 'Ödül Kayıtları', icon: <EmojiEventsOutlinedIcon />, roles: ['YONETICI', 'ADMIN', 'IK'] },
    },
  },
  {
    // US-08E.1.1/1.3: GET /api/surveys backend'de rol kısıtlı DEĞİL — liste
    // HERKESE (oturumlu) görünür, yalnızca "Yeni Anket" aksiyonu sayfanın
    // KENDİ İÇİNDE ADMIN/IK'ya GÖRSEL olarak kısıtlanır (bkz. SurveysPage).
    path: '/surveys',
    element: (
      <ProtectedRoute>
        <SurveysPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Anketler', nav: { group: 'Çalışan Deneyimi', label: 'Anketler', icon: <PollOutlinedIcon /> } },
  },
  {
    // US-08E.1.2: nav girişi YOK, `/surveys` listesinden ulaşılır.
    path: '/surveys/:id/answer',
    element: (
      <ProtectedRoute>
        <SurveyAnswerPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Anketi Yanıtla' },
  },
  {
    // US-08E.1.3: nav girişi YOK, `/surveys` listesinden (yalnızca ADMIN/IK'ya
    // görünen "Sonuçlar" aksiyonuyla) ulaşılır.
    path: '/surveys/:id/results',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <SurveyResultsPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Anket Sonuçları' },
  },
  {
    // US-08F.1.1: Herkes (oturumlu) kendi talebini gönderir/görür.
    path: '/suggestions',
    element: (
      <ProtectedRoute>
        <MySuggestionsPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Taleplerim', nav: { group: 'Çalışan Deneyimi', label: 'Taleplerim', icon: <TipsAndUpdatesOutlinedIcon /> } },
  },
  {
    // US-08F.1.2: durum güncelleme — backend'de rol kısıtı YOK, frontend'de
    // ADMIN/IK'ya GÖRSEL olarak kısıtlanır (`discipline.WarningsPage`'deki
    // AYNI karar).
    path: '/suggestions/manage',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <SuggestionsManagePage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Talep Yönetimi',
      nav: { group: 'İK Süreçleri', label: 'Talep Yönetimi', icon: <RateReviewOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08F.1.1'in ön koşulu: roadmap KENDİSİ bir route olarak itemize
    // ETMEDİ ama `POST /suggestions`'ın beklediği `categoryId`'nin bir
    // yerde YÖNETİLMESİ gerekir — `organization.JobTitlesPage`'deki AYNI
    // "ayrı, sade CRUD ekranı" deseni (bkz. sayfanın KENDİ dosyasındaki not).
    path: '/suggestions/categories',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <SuggestionCategoriesPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Talep Kategorileri',
      nav: { group: 'İK Süreçleri', label: 'Talep Kategorileri', icon: <LabelOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08G.1.1: GET /api/clubs backend'de rol kısıtlı DEĞİL — liste
    // HERKESE (oturumlu) görünür (bkz. ClubController javadoc'u).
    path: '/clubs',
    element: (
      <ProtectedRoute>
        <ClubsPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Kulüpler', nav: { group: 'Çalışan Deneyimi', label: 'Kulüpler', icon: <GroupsOutlinedIcon /> } },
  },
  {
    // US-08G.1.2: nav girişi YOK, `/clubs` listesinden ulaşılır.
    path: '/clubs/:id',
    element: (
      <ProtectedRoute>
        <ClubDetailPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Kulüp Detayı' },
  },
  {
    // US-08G.1.1: roadmap KENDİSİ ayrı bir route olarak İTEMİZE ETMEDİ ama
    // `ClubController` TAM CRUD sunduğundan (+ lider ataması) eklendi —
    // bkz. `ClubsManagePage`'in KENDİ dosyasındaki not.
    path: '/clubs/manage',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <ClubsManagePage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Kulüp Yönetimi',
      nav: { group: 'İK Süreçleri', label: 'Kulüp Yönetimi', icon: <ManageAccountsOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08G.1.1 kabul kriteri: "Talep İK onayına gider."
    path: '/clubs/membership-requests',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <ClubMembershipRequestsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Kulüp Üyelik Talepleri',
      nav: { group: 'İK Süreçleri', label: 'Kulüp Üyelik Talepleri', icon: <ChecklistOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08H.1.1: roadmap'in rol tablosu — yalnızca ADMIN (IK dahil DEĞİL).
    path: '/appointments/services',
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <ServiceOfferingsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Hizmet ve Slot Yönetimi',
      nav: { group: 'İK Süreçleri', label: 'Hizmet ve Slot Yönetimi', icon: <MedicalServicesOutlinedIcon />, roles: ['ADMIN'] },
    },
  },
  {
    // US-08H.1.2: Herkes (oturumlu) kendi randevusunu alır/görür.
    path: '/appointments/book',
    element: (
      <ProtectedRoute>
        <AppointmentBookingPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Randevu Al', nav: { group: 'Çalışan İşlemleri', label: 'Randevu Al', icon: <EventOutlinedIcon /> } },
  },
  {
    // US-08H.1.3 (SEC-020): `GET .../note` backend'de yalnızca ADMIN/IK'ya
    // açık (bkz. AppointmentNoteController'ın `@PreAuthorize`'ı) — bu
    // rota AYNI kısıta frontend'de de uyuyor.
    path: '/appointments/notes',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <AppointmentNotesPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Randevu Notları',
      nav: { group: 'İK Süreçleri', label: 'Randevu Notları', icon: <NoteAltOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08I.1.1: roadmap'in rol tablosu — ADMIN, IK. Bağımsız bir route
    // (`organization.OrganizationLayout`'un ADMIN/IK-only sekme çubuğuna
    // KASITLI OLARAK EKLENMEDİ — o sabit `TABS` dizisi 13.4'ün birim/unvan/
    // çalışan CRUD'ına özgü, 8I'nin KENDİ roadmap satırıyla karışmaması için).
    path: '/documents/policies',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <PolicyDocumentsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Politika Dokümanları',
      nav: { group: 'Organizasyon', label: 'Politika Dokümanları', icon: <DescriptionOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    path: '/documents/job-descriptions',
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <JobDescriptionsPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Görev Tanımları',
      nav: { group: 'Organizasyon', label: 'Görev Tanımları', icon: <AssignmentOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
  },
  {
    // US-08I.1.3: roadmap'in rol tablosu — Herkes (oturumlu).
    path: '/organization/chart',
    element: (
      <ProtectedRoute>
        <OrganizationChartPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Organizasyon Şeması', nav: { group: 'Organizasyon', label: 'Organizasyon Şeması', icon: <AccountTreeOutlinedIcon /> } },
  },
  {
    path: '/audit',
    // Bölüm 13.8: backend'in @PreAuthorize("hasRole('ADMIN')") ile AYNI
    // kısıt — DENETIM rolü henüz YOK (bkz. auth.entity.Role), roadmap'in
    // kendi notuyla uyumlu VARSAYILAN.
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <AuditLogPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Audit Kayıtları',
      nav: { group: 'Yönetim', label: 'Audit Kayıtları', icon: <HistoryOutlinedIcon />, roles: ['ADMIN'] },
    },
  },
  {
    // Bölüm 14.1 (US-02.2.4): herkes (oturumlu) kendi profilini görür —
    // menüde YER ALMAZ, `UserMenu`'deki "Profilim" girişinden ulaşılır
    // (bkz. `employees/:id` deseninin AYNISI — nav OMİT edilir).
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
    handle: { title: 'Profilim' },
  },
  {
    path: '/admin/users',
    // Bölüm 14.1 (US-02.2.2): backend'in @PreAuthorize("hasRole('ADMIN')")
    // ile AYNI kısıt (yalnızca POST/DELETE ADMIN-only, ama liste sayfası da
    // GÖRSEL olarak aynı role kısıtlanır — GET'in kendisi rol kısıtsız,
    // bkz. UserController javadoc'u).
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <UsersListPage />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Kullanıcılar',
      nav: { group: 'Yönetim', label: 'Kullanıcılar', icon: <PeopleAltOutlinedIcon />, roles: ['ADMIN'] },
    },
  },
  {
    path: '/admin/users/:id/roles',
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <UserRolesPage />
      </ProtectedRoute>
    ),
    handle: { title: 'Rol Yönetimi' },
  },
  {
    path: '/403',
    element: <Forbidden />,
    handle: { title: 'Yetkisiz Erişim' },
  },
]

// Menü yeniden düzenlemesi (13.2 revizyonu): "Çalışanlar" kısayolu (BottomNav
// için) `OrganizationLayout`'un iç içe (relative path'li) `employees` alt
// route'una eklenince, ÖNCEKİ sığ (yalnızca `appRoutes`'un ÜST seviyesini
// tarayan) türetme YETERSİZ kaldı — bu fonksiyon `children`'a REKÜRSİF iner,
// göreli path'leri ebeveynle BİRLEŞTİRİR (react-router'ın kendi path
// birleştirme kuralıyla AYNI). Tek kaynak ilkesi KORUNUR — ayrı bir
// menuConfig İCAT EDİLMEZ.
function collectNavItems(routes: RouteObject[], parentPath: string): NavItem[] {
  const items: NavItem[] = []
  for (const route of routes) {
    const handle = route.handle as RouteHandle | undefined
    const fullPath = !route.path
      ? parentPath
      : route.path.startsWith('/')
        ? route.path
        : `${parentPath === '/' ? '' : parentPath}/${route.path}`
    if (handle?.nav) {
      items.push({ ...handle.nav, path: fullPath })
    }
    if (route.children) {
      items.push(...collectNavItems(route.children, fullPath))
    }
  }
  return items
}

export const navigationItems: NavItem[] = collectNavItems(appRoutes, '/')

export function filterNavItemsByRoles(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.some((role) => userRoles.includes(role)))
}

export type NavItemGroup = { group: NavGroup; items: NavItem[] }

// Menü yeniden düzenlemesi (13.2 revizyonu): açılır-kapanır grup bölümleri
// (bkz. GroupedNavList) — `NAV_GROUPS`'un TANIMLI sırasına göre döner, rol
// filtresinden sonra HİÇ öğesi kalmayan bir grup TAMAMEN atlanır (boş bir
// başlık gösterilmez).
export function groupNavItems(items: NavItem[]): NavItemGroup[] {
  return NAV_GROUPS.map((group) => ({ group, items: items.filter((item) => item.group === group) })).filter(
    (entry) => entry.items.length > 0,
  )
}

// Bölüm 4.3 revizyonu: BottomNavigation artık TÜM menüyü değil, sabit bir
// öncelik listesini gösterir (en fazla 4 kısayol + "Diğer" = 5 öğe).
// Yalnızca PATH+KISA ETİKET burada tanımlanır — ikon/rol AYRI bir yerde
// TEKRAR EDİLMEZ, `navigationItems`'teki (zaten rol filtresinden geçmiş)
// karşılığından okunur; kullanıcının erişemediği bir hedef `items` içinde
// bulunamayacağından kendiliğinden ATLANIR.
const BOTTOM_NAV_TARGETS: { path: string; shortLabel: string }[] = [
  { path: '/', shortLabel: 'Ana Sayfa' },
  { path: '/organization/employees', shortLabel: 'Çalışanlar' },
  { path: '/leave/requests', shortLabel: 'İzinler' },
  { path: '/leave/approvals', shortLabel: 'Onaylar' },
]

export function getBottomNavItems(roleFilteredItems: NavItem[]): NavItem[] {
  const itemByPath = new Map(roleFilteredItems.map((item) => [item.path, item]))
  return BOTTOM_NAV_TARGETS.map(({ path, shortLabel }) => {
    const match = itemByPath.get(path)
    return match ? { ...match, label: shortLabel } : null
  }).filter((item): item is NavItem => item !== null)
}
