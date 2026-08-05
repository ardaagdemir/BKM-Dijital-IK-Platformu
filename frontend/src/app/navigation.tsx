import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
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
import { JobTitlesPage } from '../modules/organization/pages/JobTitlesPage'
import { OrganizationLayout } from '../modules/organization/pages/OrganizationLayout'
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

export type NavItem = {
  label: string
  path: string
  icon: ReactElement
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
    handle: { title: 'Ana Sayfa', nav: { label: 'Ana Sayfa', icon: <HomeOutlinedIcon /> } },
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
      nav: { label: 'Organizasyon', icon: <ApartmentOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
        handle: { title: 'Çalışanlar' },
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
      nav: { label: 'İzin Türleri', icon: <CategoryOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'İzin Bakiyem', icon: <AccountBalanceWalletOutlinedIcon /> },
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
      nav: { label: 'İzin Taleplerim', icon: <EventAvailableOutlinedIcon /> },
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
      nav: { label: 'Onay Bekleyenler', icon: <FactCheckOutlinedIcon />, roles: ['YONETICI'] },
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
      nav: { label: 'Norm Kadrolar', icon: <AssignmentIndOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Adaylar', icon: <PersonSearchOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'İşe Alım Talepleri', icon: <WorkOutlineOutlinedIcon />, roles: ['ADMIN', 'IK', 'YONETICI'] },
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
      nav: { label: 'Performans Ayarları', icon: <TrackChangesOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Öz Değerlendirme', icon: <RateReviewOutlinedIcon /> },
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
      nav: { label: 'Ekip Değerlendirmeleri', icon: <SupervisorAccountOutlinedIcon />, roles: ['YONETICI'] },
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
      nav: { label: 'Performans Sonuçlarım', icon: <TrendingUpOutlinedIcon /> },
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
      nav: { label: 'Çalışma Modelleri', icon: <ScheduleOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Devam Kayıtları', icon: <EventNoteOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Vardiya Sapmaları', icon: <WarningAmberOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Puantaj', icon: <CalendarMonthOutlinedIcon /> },
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
      nav: { label: 'Eğitim Kataloğu', icon: <SchoolOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Eğitimlerim', icon: <MenuBookOutlinedIcon /> },
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
      nav: { label: 'Eğitim Onayları', icon: <HowToRegOutlinedIcon />, roles: ['YONETICI'] },
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
      nav: { label: 'Tamamlanan Eğitimler', icon: <TaskAltOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Seyahat Taleplerim', icon: <FlightTakeoffOutlinedIcon /> },
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
      nav: { label: 'Uyarı Kayıtları', icon: <ReportProblemOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Ceza Süreçleri', icon: <GavelOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Ödül Kayıtları', icon: <EmojiEventsOutlinedIcon />, roles: ['YONETICI', 'ADMIN', 'IK'] },
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
    handle: { title: 'Anketler', nav: { label: 'Anketler', icon: <PollOutlinedIcon /> } },
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
    handle: { title: 'Taleplerim', nav: { label: 'Taleplerim', icon: <TipsAndUpdatesOutlinedIcon /> } },
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
      nav: { label: 'Talep Yönetimi', icon: <RateReviewOutlinedIcon />, roles: ['ADMIN', 'IK'] },
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
      nav: { label: 'Talep Kategorileri', icon: <LabelOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
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
      nav: { label: 'Audit Kayıtları', icon: <HistoryOutlinedIcon />, roles: ['ADMIN'] },
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
      nav: { label: 'Kullanıcılar', icon: <PeopleAltOutlinedIcon />, roles: ['ADMIN'] },
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

export const navigationItems: NavItem[] = appRoutes
  .filter((route): route is AppRoute & { handle: { nav: Omit<NavItem, 'path'> } } => !!route.handle.nav)
  .map((route) => ({ ...route.handle.nav, path: route.path }))

export function filterNavItemsByRoles(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.some((role) => userRoles.includes(role)))
}
