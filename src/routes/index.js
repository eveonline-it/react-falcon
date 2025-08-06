import React, { Suspense, lazy } from 'react';
import App from 'App';
import paths, { rootPaths } from './paths';
import { Navigate, createBrowserRouter } from 'react-router';

import MainLayout from '../layouts/MainLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import Landing from 'components/pages/landing/Landing';
import ProtectedRoute from 'components/auth/ProtectedRoute';
const Accordion = lazy(() => import('components/doc-components/Accordion'));
const Alerts = lazy(() => import('components/doc-components/Alerts'));
const Badges = lazy(() => import('components/doc-components/Badges'));
const Breadcrumbs = lazy(() => import('components/doc-components/Breadcrumb'));
const Buttons = lazy(() => import('components/doc-components/Buttons'));
const CalendarExample = lazy(() =>
  import('components/doc-components/CalendarExample')
);
const Cards = lazy(() => import('components/doc-components/Cards'));
const Dropdowns = lazy(() => import('components/doc-components/Dropdowns'));
const ListGroups = lazy(() => import('components/doc-components/ListGroups'));
const Modals = lazy(() => import('components/doc-components/Modals'));
const Offcanvas = lazy(() => import('components/doc-components/Offcanvas'));
const Pagination = lazy(() => import('components/doc-components/Pagination'));
const BasicProgressBar = lazy(() => import('components/doc-components/ProgressBar'));
const Spinners = lazy(() => import('components/doc-components/Spinners'));
const Toasts = lazy(() => import('components/doc-components/Toasts'));
const Avatar = lazy(() => import('components/doc-components/Avatar'));
const Image = lazy(() => import('components/doc-components/Image'));
const Tooltips = lazy(() => import('components/doc-components/Tooltips'));
const Popovers = lazy(() => import('components/doc-components/Popovers'));
const Figures = lazy(() => import('components/doc-components/Figures'));
const Hoverbox = lazy(() => import('components/doc-components/Hoverbox'));
const Tables = lazy(() => import('components/doc-components/Tables'));
const FormControl = lazy(() => import('components/doc-components/FormControl'));
const InputGroup = lazy(() => import('components/doc-components/InputGroup'));
const Select = lazy(() => import('components/doc-components/Select'));
const Checks = lazy(() => import('components/doc-components/Checks'));
const Range = lazy(() => import('components/doc-components/Range'));
const FormLayout = lazy(() => import('components/doc-components/FormLayout'));
const FloatingLabels = lazy(() => import('components/doc-components/FloatingLabels'));
const FormValidation = lazy(() => import('components/doc-components/FormValidation'));
const BootstrapCarousel = lazy(() => import('components/doc-components/BootstrapCarousel'));
const SlickCarousel = lazy(() => import('components/doc-components/SlickCarousel'));
const Navs = lazy(() => import('components/doc-components/Navs'));
const Navbars = lazy(() => import('components/doc-components/Navbars'));
const Tabs = lazy(() => import('components/doc-components/Tabs'));
const Collapse = lazy(() => import('components/doc-components/Collapse'));
const CountUp = lazy(() => import('components/doc-components/CountUp'));
const Embed = lazy(() => import('components/doc-components/Embed'));
const Backgrounds = lazy(() => import('components/doc-components/Backgrounds'));
const Search = lazy(() => import('components/doc-components/Search'));
const VerticalNavbar = lazy(() => import('components/doc-components/VerticalNavbar'));
const NavBarTop = lazy(() => import('components/doc-components/NavBarTop'));
const NavbarDoubleTop = lazy(() => import('components/doc-components/NavbarDoubleTop'));
const ComboNavbar = lazy(() => import('components/doc-components/ComboNavbar'));
const TypedText = lazy(() => import('components/doc-components/TypedText'));
const FileUploader = lazy(() => import('components/doc-components/FileUploader'));
const Borders = lazy(() => import('components/utilities/Borders'));
const Colors = lazy(() => import('components/utilities/Colors'));
const Background = lazy(() => import('components/utilities/Background'));
const ColoredLinks = lazy(() => import('components/utilities/ColoredLinks'));
const Display = lazy(() => import('components/utilities/Display'));
const Visibility = lazy(() => import('components/utilities/Visibility'));
const StretchedLink = lazy(() => import('components/utilities/StretchedLink'));
const Float = lazy(() => import('components/utilities/Float'));
const Position = lazy(() => import('components/utilities/Position'));
const Spacing = lazy(() => import('components/utilities/Spacing'));
const Sizing = lazy(() => import('components/utilities/Sizing'));
const TextTruncation = lazy(() => import('components/utilities/TextTruncation'));
const Typography = lazy(() => import('components/utilities/Typography'));
const VerticalAlign = lazy(() => import('components/utilities/VerticalAlign'));
const Flex = lazy(() => import('components/utilities/Flex'));
const Grid = lazy(() => import('components/utilities/Grid'));
const WizardForms = lazy(() => import('components/doc-components/WizardForms'));
const GettingStarted = lazy(() => import('components/documentation/GettingStarted'));
const Configuration = lazy(() => import('components/documentation/Configuration'));
const DarkMode = lazy(() => import('components/documentation/DarkMode'));
const Plugins = lazy(() => import('components/documentation/Plugins'));
const Styling = lazy(() => import('components/documentation/Styling'));
const DesignFile = lazy(() => import('components/documentation/DesignFile'));
const Starter = lazy(() => import('components/pages/Starter'));
const AnimatedIcons = lazy(() => import('components/doc-components/AnimatedIcons'));
const DatePicker = lazy(() => import('components/doc-components/DatePicker'));
const FontAwesome = lazy(() => import('components/doc-components/FontAwesome'));
const Changelog = lazy(() => import('components/documentation/change-log/ChangeLog'));
const Analytics = lazy(() => import('components/dashboards/analytics'));
const Crm = lazy(() =>
  import('components/dashboards/crm')
);
const Saas = lazy(() =>
  import('components/dashboards/saas')
);
const Profile = lazy(() => import('components/pages/user/profile/Profile'));
const Associations = lazy(() => import('components/pages/asscociations/Associations'));
const Followers = lazy(() => import('components/app/social/followers/Followers'));
const Notifications = lazy(() => import('components/app/social/notifications/Notifications'));
const ActivityLog = lazy(() => import('components/app/social/activity-log/ActivityLog'));
const Settings = lazy(() => import('components/pages/user/settings/Settings'));
const Feed = lazy(() => import('components/app/social/feed/Feed'));
const Placeholder = lazy(() => import('components/doc-components/Placeholder'));
const Lightbox = lazy(() => import('components/doc-components/Lightbox'));
const AdvanceTableExamples = lazy(() => import('components/doc-components/AdvanceTableExamples'));
const Calendar = lazy(() => import('components/app/calendar/Calendar'));
import FaqAlt from 'components/pages/faq/faq-alt/FaqAlt';
import FaqBasic from 'components/pages/faq/faq-basic/FaqBasic';
import FaqAccordion from 'components/pages/faq/faq-accordion/FaqAccordion';
import PrivacyPolicy from 'components/pages/miscellaneous/privacy-policy/PrivacyPolicy';
import InvitePeople from 'components/pages/miscellaneous/invite-people/InvitePeople';
import PricingDefault from 'components/pages/pricing/pricing-default/PricingDefault';
import PricingAlt from 'components/pages/pricing/pricing-alt/PricingAlt';
import CreateEvent from 'components/app/events/create-an-event/CreateEvent';
import EventList from 'components/app/events/event-list/EventList';
import EventDetail from 'components/app/events/event-detail/EventDetail';
import EmailDetail from 'components/app/email/email-detail/EmailDetail';
import Compose from 'components/app/email/compose/Compose';
import Inbox from 'components/app/email/inbox/Inbox';
import Rating from 'components/doc-components/Rating';
import AdvanceSelect from 'components/doc-components/AdvanceSelect';
import Editor from 'components/doc-components/Editor';
import Chat from 'components/app/chat/Chat';
const Kanban = lazy(() => import('components/app/kanban/Kanban'));
import DraggableExample from 'components/doc-components/DraggableExample';
const LineCharts = lazy(() => import('components/doc-components/charts-example/echarts/line-charts'));
const BarCharts = lazy(() => import('components/doc-components/charts-example/echarts/bar-charts'));
const CandlestickCharts = lazy(() => import('components/doc-components/charts-example/echarts/candlestick-charts'));
const GeoMaps = lazy(() => import('components/doc-components/charts-example/echarts/geo-map'));
const ScatterCharts = lazy(() => import('components/doc-components/charts-example/echarts/scatter-charts'));
const PieCharts = lazy(() => import('components/doc-components/charts-example/echarts/pie-charts'));
const RadarCharts = lazy(() => import('components/doc-components/charts-example/echarts/radar-charts/Index'));
const HeatmapCharts = lazy(() => import('components/doc-components/charts-example/echarts/heatmap-chart'));
const Chartjs = lazy(() => import('components/doc-components/charts-example/chartjs'));
const D3js = lazy(() => import('components/doc-components/charts-example/d3'));
import HowToUse from 'components/doc-components/charts-example/echarts/HowToUse';
const GoogleMapExample = lazy(() => import('components/doc-components/GoogleMapExample'));
import LeafletMapExample from 'components/doc-components/LeafletMapExample';
import CookieNoticeExample from 'components/doc-components/CookieNoticeExample';
import Scrollbar from 'components/doc-components/Scrollbar';
import Scrollspy from 'components/doc-components/Scrollspy';
import ReactIcons from 'components/doc-components/ReactIcons';
import ReactPlayerExample from 'components/doc-components/ReactPlayerExample';
import EmojiPickerExample from 'components/doc-components/EmojiPicker';
import TreeviewExample from 'components/doc-components/TreeviewExample';
import Timeline from 'components/doc-components/Timeline';
const Widgets = lazy(() => import('widgets/Widgets'));
const ProjectManagement = lazy(() => import('components/dashboards/project-management'));
import Migration from 'components/documentation/migration/Migration';

import Error404 from 'components/errors/Error404';
import Error500 from 'components/errors/Error500';

import CardEveLogin from 'components/authentication/card/EveLogin';
const Dashboard = lazy(() => import('components/dashboards/default'));
import Faq from 'components/documentation/Faq';
const SupportDesk = lazy(() => import('components/dashboards/support-desk'));
import TableView from 'components/app/support-desk/tickets-layout/TableView';
import CardView from 'components/app/support-desk/tickets-layout/CardView';
import Contacts from 'components/app/support-desk/contacts/Contacts';
import ContactDetails from 'components/app/support-desk/contact-details/ContactDetails';
import TicketsPreview from 'components/app/support-desk/tickets-preview/TicketsPreview';
import QuickLinks from 'components/app/support-desk/quick-links/QuickLinks';
import Reports from 'components/app/support-desk/reports/Reports';
import InputMaskExample from 'components/doc-components/InputMaskExample';
import RangeSlider from 'components/doc-components/RangeSlider';
import VerticalNavLayout from 'layouts/VerticalNavLayout';
import TopNavLayout from 'layouts/TopNavLayout';
import ComboNavLayout from 'layouts/ComboNavLayout';
import DoubleTopNavLayout from 'layouts/DoubleTopNavLayout';
import FalconLoader from 'components/common/FalconLoader';

const routes = [
  {
    element: <App />,
    children: [
      {
        path: 'landing',
        element: <Landing />
      },
      {
        path: rootPaths.errorsRoot,
        element: <ErrorLayout />,
        children: [
          {
            path: paths.error404,
            element: <Error404 />
          },
          {
            path: paths.error500,
            element: <Error500 />
          }
        ]
      },
      {
        path: 'login',
        element: <CardEveLogin />
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/analytics" replace />
          },
          {
            path: rootPaths.dashboardRoot,
            children: [
              {
                path: paths.analytics,
                element: (
                  <Suspense key="dashboard-analytics" fallback={<FalconLoader />}>
                    <Analytics />
                  </Suspense>
                )
              },
              {
                path: paths.crm,
                element: (
                  <Suspense key="dashboard-crm" fallback={<FalconLoader />}>
                    <Crm />
                  </Suspense>
                )
              },
              {
                path: paths.saas,
                element: (
                  <Suspense key="dashboard-sass" fallback={<FalconLoader />}>
                    <Saas />
                  </Suspense>
                )
              },
              {
                path: paths.projectManagement,
                element: (
                  <Suspense key="dashboard-projectManagement" fallback={<FalconLoader />}>
                    <ProjectManagement />
                  </Suspense>
                )
              },
              {
                path: paths.supportDesk,
                element: (
                  <Suspense key="dashboard-supportDesk" fallback={<FalconLoader />}>
                    <SupportDesk />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.appsRoot,
            children: [
              {
                path: paths.calendar,
                element: (
                  <Suspense key="calendar" fallback={<FalconLoader />}>
                    <Calendar />
                  </Suspense>
                )
              },
              {
                path: paths.chat,
                element: <Chat />
              },
              {
                path: paths.kanban,
                element: (
                  <Suspense key="kanban" fallback={<FalconLoader />}>
                    <Kanban />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.emailRoot,
            children: [
              {
                path: paths.emailInbox,
                element: <Inbox />
              },
              {
                path: paths.emailDetail,
                element: <EmailDetail />
              },
              {
                path: paths.emailCompose,
                element: <Compose />
              }
            ]
          },
          {
            path: rootPaths.eventsRoot,
            children: [
              {
                path: paths.createEvent,
                element: <CreateEvent />
              },
              {
                path: paths.eventDetail,
                element: <EventDetail />
              },
              {
                path: paths.eventList,
                element: <EventList />
              }
            ]
          },
          {
            path: rootPaths.socialRoot,
            children: [
              {
                path: paths.feed,
                element: <Feed />
              },
              {
                path: paths.activityLog,
                element: <ActivityLog />
              },
              {
                path: paths.notifications,
                element: <Notifications />
              },
              {
                path: paths.followers,
                element: <Followers />
              }
            ]
          },
          {
            path: rootPaths.supportDeskRoot,
            children: [
              {
                path: paths.ticketsTable,
                element: <TableView />
              },
              {
                path: paths.ticketsCard,
                element: <CardView />
              },
              {
                path: paths.contacts,
                element: <Contacts />
              },
              {
                path: paths.contactDetails,
                element: <ContactDetails />
              },
              {
                path: paths.ticketsPreview,
                element: <TicketsPreview />
              },
              {
                path: paths.quickLinks,
                element: <QuickLinks />
              },
              {
                path: paths.reports,
                element: <Reports />
              }
            ]
          },
          {
            path: rootPaths.pagesRoot,
            children: [
              {
                path: paths.starter,
                element: <Starter />
              }
            ]
          },
          {
            path: rootPaths.userRoot,
            children: [
              {
                path: paths.userProfile,
                element: <Profile />
              },
              {
                path: paths.userSettings,
                element: <Settings />
              }
            ]
          },
          {
            path: rootPaths.pricingRoot,
            children: [
              {
                path: paths.pricingDefault,
                element: <PricingDefault />
              },
              {
                path: paths.pricingAlt,
                element: <PricingAlt />
              }
            ]
          },
          {
            path: rootPaths.faqRoot,
            children: [
              {
                path: paths.faqBasic,
                element: <FaqBasic />
              },
              {
                path: paths.faqAlt,
                element: <FaqAlt />
              },
              {
                path: paths.faqAccordion,
                element: <FaqAccordion />
              }
            ]
          },
          {
            path: rootPaths.miscRoot,
            children: [
              {
                path: paths.associations,
                element: <Associations />
              },
              {
                path: paths.invitePeople,
                element: <InvitePeople />
              },
              {
                path: paths.privacyPolicy,
                element: <PrivacyPolicy />
              }
            ]
          },
          {
            path: rootPaths.formsRoot,
            children: [
              {
                path: rootPaths.basicFormsRoot,
                children: [
                  {
                    path: paths.formControl,
                    element: <FormControl />
                  },
                  {
                    path: paths.inputGroup,
                    element: <InputGroup />
                  },
                  {
                    path: paths.select,
                    element: <Select />
                  },
                  {
                    path: paths.checks,
                    element: <Checks />
                  },
                  {
                    path: paths.range,
                    element: <Range />
                  },
                  {
                    path: paths.formLayout,
                    element: <FormLayout />
                  }
                ]
              },
              {
                path: rootPaths.advanceFormsRoot,
                children: [
                  {
                    path: paths.advanceSelect,
                    element: <AdvanceSelect />
                  },
                  {
                    path: paths.datePicker,
                    element: <DatePicker />
                  },
                  {
                    path: paths.editor,
                    element: <Editor />
                  },
                  {
                    path: paths.emojiButton,
                    element: <EmojiPickerExample />
                  },
                  {
                    path: paths.fileUploader,
                    element: <FileUploader />
                  },
                  {
                    path: paths.inputMask,
                    element: <InputMaskExample />
                  },
                  {
                    path: paths.rangeSlider,
                    element: <RangeSlider />
                  },
                  {
                    path: paths.rating,
                    element: <Rating />
                  }
                ]
              },
              {
                path: paths.floatingLabels,
                element: <FloatingLabels />
              },
              {
                path: paths.wizard,
                element: <WizardForms />
              },
              {
                path: paths.validation,
                element: <FormValidation />
              }
            ]
          },
          {
            path: rootPaths.tableRoot,
            children: [
              {
                path: paths.basicTables,
                element: (
                  <Suspense key="tables" fallback={<FalconLoader />}>
                    <Tables />
                  </Suspense>
                )
              },
              {
                path: paths.advanceTables,
                element: (
                  <Suspense key="advanceTables" fallback={<FalconLoader />}>
                    <AdvanceTableExamples />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.chartsRoot,
            children: [
              {
                path: paths.chartjs,
                element: (
                  <Suspense key="chartjs" fallback={<FalconLoader />}>
                    <Chartjs />
                  </Suspense>
                )
              },
              {
                path: paths.d3js,
                element: (
                  <Suspense key="d3j" fallback={<FalconLoader />}>
                    <D3js />
                  </Suspense>
                )
              },
              {
                path: rootPaths.echartsRoot,
                children: [
                  {
                    path: paths.echartsHowToUse,
                    element: <HowToUse />
                  },
                  {
                    path: paths.lineCharts,
                    element: (
                      <Suspense key="echarts-lineChart" fallback={<FalconLoader />}>
                        <LineCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.barCharts,
                    element: (
                      <Suspense key="echarts-barChart" fallback={<FalconLoader />}>
                        <BarCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.candlestickCharts,
                    element: (
                      <Suspense key="echarts-candleStick" fallback={<FalconLoader />}>
                        <CandlestickCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.geoMap,
                    element: (
                      <Suspense key="echarts-geoMap" fallback={<FalconLoader />}>
                        <GeoMaps />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.scatterCharts,
                    element: (
                      <Suspense key="echarts-scatterChart" fallback={<FalconLoader />}>
                        <ScatterCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.pieCharts,
                    element: (
                      <Suspense key="echarts-pieChart" fallback={<FalconLoader />}>
                        <PieCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.radarCharts,
                    element: (
                      <Suspense key="echarts-radarChart" fallback={<FalconLoader />}>
                        <RadarCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.heatmapCharts,
                    element: (
                      <Suspense key="echarts-heatmapChart" fallback={<FalconLoader />}>
                        <HeatmapCharts />
                      </Suspense>
                    )
                  }
                ]
              }
            ]
          },
          {
            path: rootPaths.iconsRoot,
            children: [
              {
                path: paths.fontAwesome,
                element: <FontAwesome />
              },
              {
                path: paths.reactIcons,
                element: <ReactIcons />
              }
            ]
          },
          {
            path: rootPaths.mapsRoot,
            children: [
              {
                path: paths.googleMap,
                element: (
                  <Suspense key="googleMap" fallback={<FalconLoader />}>
                    <GoogleMapExample />
                  </Suspense>
                )
              },
              {
                path: paths.leafletMap,
                element: (
                  <Suspense key="leafletMap" fallback={<FalconLoader />}>
                    <LeafletMapExample />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.componentsRoot,
            children: [
              {
                path: paths.alerts,
                element: (
                  <Suspense key="alerts" fallback={<FalconLoader />}>
                    <Alerts />
                  </Suspense>
                )
              },
              {
                path: paths.accordion,
                element: (
                  <Suspense key="accordion" fallback={<FalconLoader />}>
                    <Accordion />
                  </Suspense>
                )
              },
              {
                path: paths.animatedIcons,
                element: <AnimatedIcons />
              },
              {
                path: paths.background,
                element: <Backgrounds />
              },
              {
                path: paths.badges,
                element: (
                  <Suspense key="badges" fallback={<FalconLoader />}>
                    <Badges />
                  </Suspense>
                )
              },
              {
                path: paths.breadcrumbs,
                element: (
                  <Suspense key="breadcrumbs" fallback={<FalconLoader />}>
                    <Breadcrumbs />
                  </Suspense>
                )
              },
              {
                path: paths.buttons,
                element: (
                  <Suspense key="buttons" fallback={<FalconLoader />}>
                    <Buttons />
                  </Suspense>
                )
              },
              {
                path: paths.calendarExample,
                element: (
                  <Suspense key="calendarExample" fallback={<FalconLoader />}>
                    <CalendarExample />
                  </Suspense>
                )
              },
              {
                path: paths.cards,
                element: <Cards />
              },
              {
                path: paths.cards,
                element: <Cards />
              },
              {
                path: rootPaths.carouselRoot,
                children: [
                  {
                    path: paths.bootstrapCarousel,
                    element: <BootstrapCarousel />
                  },
                  {
                    path: paths.slickCarousel,
                    element: <SlickCarousel />
                  }
                ]
              },
              {
                path: paths.collapse,
                element: <Collapse />
              },
              {
                path: paths.cookieNotice,
                element: <CookieNoticeExample />
              },
              {
                path: paths.countup,
                element: <CountUp />
              },
              {
                path: paths.draggable,
                element: <DraggableExample />
              },
              {
                path: paths.dropdowns,
                element: <Dropdowns />
              },
              {
                path: paths.listGroup,
                element: <ListGroups />
              },
              {
                path: paths.modals,
                element: <Modals />
              },
              {
                path: paths.offcanvas,
                element: <Offcanvas />
              },
              {
                path: rootPaths.navsAndTabsRoot,
                children: [
                  {
                    path: paths.navs,
                    element: <Navs />
                  },
                  {
                    path: paths.navbar,
                    element: <Navbars />
                  },
                  {
                    path: paths.verticalNavbar,
                    element: <VerticalNavbar />
                  },
                  {
                    path: paths.topNavbar,
                    element: <NavBarTop />
                  },
                  {
                    path: paths.doubleTopNavbar,
                    element: <NavbarDoubleTop />
                  },
                  {
                    path: paths.comboNavbar,
                    element: <ComboNavbar />
                  },
                  {
                    path: paths.tabs,
                    element: <Tabs />
                  }
                ]
              },
              {
                path: rootPaths.picturesRoot,
                children: [
                  {
                    path: paths.avatar,
                    element: <Avatar />
                  },
                  {
                    path: paths.images,
                    element: <Image />
                  },
                  {
                    path: paths.figures,
                    element: <Figures />
                  },
                  {
                    path: paths.hoverbox,
                    element: <Hoverbox />
                  },
                  {
                    path: paths.lightbox,
                    element: <Lightbox />
                  }
                ]
              },
              {
                path: paths.progressBar,
                element: <BasicProgressBar />
              },
              {
                path: paths.pagination,
                element: <Pagination />
              },
              {
                path: paths.placeholder,
                element: <Placeholder />
              },
              {
                path: paths.popovers,
                element: <Popovers />
              },
              {
                path: paths.scrollspy,
                element: <Scrollspy />
              },
              {
                path: paths.search,
                element: <Search />
              },
              {
                path: paths.spinners,
                element: <Spinners />
              },
              {
                path: paths.timeline,
                element: <Timeline />
              },
              {
                path: paths.toasts,
                element: <Toasts />
              },
              {
                path: paths.tooltips,
                element: <Tooltips />
              },
              {
                path: paths.treeview,
                element: <TreeviewExample />
              },
              {
                path: paths.typedText,
                element: <TypedText />
              },
              {
                path: rootPaths.videosRoot,
                children: [
                  {
                    path: paths.embedVideo,
                    element: <Embed />
                  },
                  {
                    path: paths.reactPlayer,
                    element: <ReactPlayerExample />
                  }
                ]
              }
            ]
          },
          {
            path: rootPaths.utilitiesRoot,
            children: [
              {
                path: paths.backgroundColor,
                element: <Background />
              },
              {
                path: paths.borders,
                element: <Borders />
              },
              {
                path: paths.colors,
                element: <Colors />
              },
              {
                path: paths.coloredLinks,
                element: <ColoredLinks />
              },
              {
                path: paths.display,
                element: <Display />
              },
              {
                path: paths.flex,
                element: <Flex />
              },
              {
                path: paths.float,
                element: <Float />
              },
              {
                path: paths.grid,
                element: <Grid />
              },
              {
                path: paths.scrollBar,
                element: <Scrollbar />
              },
              {
                path: paths.position,
                element: <Position />
              },
              {
                path: paths.spacing,
                element: <Spacing />
              },
              {
                path: paths.sizing,
                element: <Sizing />
              },
              {
                path: paths.stretchedLink,
                element: <StretchedLink />
              },
              {
                path: paths.textTruncation,
                element: <TextTruncation />
              },
              {
                path: paths.typography,
                element: <Typography />
              },
              {
                path: paths.verticalAlign,
                element: <VerticalAlign />
              },
              {
                path: paths.visibility,
                element: <Visibility />
              }
            ]
          },
          {
            path: rootPaths.docRoot,
            children: [
              {
                path: paths.gettingStarted,
                element: <GettingStarted />
              },
              {
                path: paths.configuration,
                element: <Configuration />
              },
              {
                path: paths.styling,
                element: <Styling />
              },
              {
                path: paths.darkMode,
                element: <DarkMode />
              },
              {
                path: paths.plugin,
                element: <Plugins />
              },
              {
                path: paths.faq,
                element: <Faq />
              },
              {
                path: paths.designFile,
                element: <DesignFile />
              }
            ]
          },
          {
            path: paths.widgets,
            element: (
              <Suspense key="widgets" fallback={<FalconLoader />}>
                <Widgets />
              </Suspense>
            )
          },
          {
            path: paths.changelog,
            element: <Changelog />
          },
          {
            path: paths.migration,
            element: <Migration />
          }
        ]
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <VerticalNavLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: paths.verticalNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <TopNavLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: paths.topNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <ComboNavLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: paths.comboNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DoubleTopNavLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: paths.doubleTopNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to={paths.error404} replace />
      }
    ]
  }
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_PUBLIC_URL
});

export default routes;
