// Единый реестр иконок приложения.
// Иконку берём ТОЛЬКО отсюда — ни эмодзи, ни прямых импортов из lucide-react на страницах.
// Имя описывает сущность продукта («задание»), а не рисунок («лист бумаги»),
// поэтому смена картинки не требует правок по всему проекту.
import {
  LayoutGrid, Calendar, CalendarCheck, CalendarClock, Users, User, UserCircle, UserPlus,
  GraduationCap, FileText, CheckCircle2, Folder, FolderOpen, ListChecks, CreditCard,
  Target, BookMarked, StickyNote, NotebookPen, TrendingUp, BookText, BookOpen,
  Shield, Zap, HelpCircle, LifeBuoy, Settings, LogOut, Download, Globe, Bell, Search, History,
  Plus, Pencil, Trash2, X, Check, Copy, Upload, Link2, RotateCcw, RefreshCw,
  ArrowLeft, ChevronRight, ChevronLeft, ChevronDown, Share2, Sparkles, Lightbulb, MoreHorizontal,
  XCircle, AlertTriangle, AlertCircle, Clock, Lock, Award, Flame, Inbox,
  Landmark, Smartphone, Wallet, Phone, Mail, Send, MessageCircle, Briefcase,
  Video, Map, Layers, Repeat, PenLine, Grid3x3, Type, Scale, Cookie, Menu,
} from 'lucide-react'

// Общие размер и толщина линии для всего приложения.
// size/strokeWidth/className можно переопределить в месте использования.
const icon = (Glyph, name) => {
  const Icon = ({ size = 16, strokeWidth = 1.8, className = '', ...rest }) => (
    <Glyph size={size} strokeWidth={strokeWidth} className={`shrink-0 ${className}`} {...rest} />
  )
  Icon.displayName = name
  return Icon
}

/* ── Разделы навигации ── */
export const IconDashboard    = icon(LayoutGrid,    'IconDashboard')
export const IconCalendar     = icon(Calendar,      'IconCalendar')
export const IconLessons      = icon(BookOpen,      'IconLessons')      // объединённые «Занятия»
export const IconGroups       = icon(Users,         'IconGroups')
export const IconIndividual   = icon(User,          'IconIndividual')
export const IconStudents     = icon(GraduationCap, 'IconStudents')
export const IconHomework     = icon(FileText,      'IconHomework')
export const IconAttendance   = icon(CheckCircle2,  'IconAttendance')
export const IconMaterials    = icon(Folder,        'IconMaterials')
export const IconTests        = icon(ListChecks,    'IconTests')
export const IconPayments     = icon(CreditCard,    'IconPayments')
export const IconTopics       = icon(Target,        'IconTopics')
export const IconVocab        = icon(BookMarked,    'IconVocab')
export const IconNotes        = icon(StickyNote,    'IconNotes')
export const IconMyLessons    = icon(NotebookPen,   'IconMyLessons')
export const IconProgress     = icon(TrendingUp,    'IconProgress')
export const IconDiary        = icon(BookText,      'IconDiary')        // объединённый «Мой дневник»
export const IconDailySession = icon(CalendarCheck, 'IconDailySession')
export const IconAdmin        = icon(Shield,        'IconAdmin')
export const IconPlan         = icon(Zap,           'IconPlan')
export const IconHelp         = icon(HelpCircle,    'IconHelp')
export const IconSupport      = icon(LifeBuoy,      'IconSupport')
export const IconSettings     = icon(Settings,      'IconSettings')
export const IconProfile      = icon(UserCircle,    'IconProfile')
export const IconLogout       = icon(LogOut,        'IconLogout')
export const IconInstall      = icon(Download,      'IconInstall')
export const IconLanguage     = icon(Globe,         'IconLanguage')
export const IconNotifications= icon(Bell,          'IconNotifications')
export const IconSearch       = icon(Search,        'IconSearch')
export const IconMenu         = icon(Menu,          'IconMenu')
export const IconHistory      = icon(History,       'IconHistory')

/* ── Действия ── */
export const IconAdd      = icon(Plus,            'IconAdd')
export const IconEdit     = icon(Pencil,          'IconEdit')
export const IconDelete   = icon(Trash2,          'IconDelete')
export const IconClose    = icon(X,               'IconClose')
export const IconCheck    = icon(Check,           'IconCheck')
export const IconCopy     = icon(Copy,            'IconCopy')
export const IconUpload   = icon(Upload,          'IconUpload')
export const IconLink     = icon(Link2,           'IconLink')
export const IconReset    = icon(RotateCcw,       'IconReset')
export const IconRefresh  = icon(RefreshCw,       'IconRefresh')
export const IconBack     = icon(ArrowLeft,       'IconBack')
export const IconNext     = icon(ChevronRight,    'IconNext')
export const IconPrev     = icon(ChevronLeft,     'IconPrev')
export const IconExpand   = icon(ChevronDown,     'IconExpand')
export const IconShare    = icon(Share2,          'IconShare')
export const IconAI       = icon(Sparkles,        'IconAI')
export const IconIdea     = icon(Lightbulb,       'IconIdea')
export const IconMore     = icon(MoreHorizontal,  'IconMore')
export const IconInvite   = icon(UserPlus,        'IconInvite')

/* ── Состояния ── */
export const IconSuccess  = icon(CheckCircle2,  'IconSuccess')
export const IconError    = icon(XCircle,       'IconError')
export const IconWarning  = icon(AlertTriangle, 'IconWarning')
export const IconInfo     = icon(AlertCircle,   'IconInfo')
export const IconPending  = icon(Clock,         'IconPending')
export const IconLocked   = icon(Lock,          'IconLocked')
export const IconDeadline = icon(CalendarClock, 'IconDeadline')
export const IconGrade    = icon(Award,         'IconGrade')
export const IconStreak   = icon(Flame,         'IconStreak')
export const IconEmpty    = icon(Inbox,         'IconEmpty')

/* ── Способы оплаты ── */
export const IconBank    = icon(Landmark,   'IconBank')
export const IconBlik    = icon(Smartphone, 'IconBlik')
export const IconPaypal  = icon(Wallet,     'IconPaypal')
export const IconRevolut = icon(CreditCard, 'IconRevolut')
export const IconMoney   = icon(Wallet,     'IconMoney')

/* ── Контакты и мессенджеры (в lucide v1 нет фирменных логотипов — берём смысловые) ── */
export const IconPhone    = icon(Phone,         'IconPhone')
export const IconEmail    = icon(Mail,          'IconEmail')
export const IconTelegram = icon(Send,          'IconTelegram')
export const IconWhatsApp = icon(MessageCircle, 'IconWhatsApp')
export const IconLinkedIn = icon(Briefcase,     'IconLinkedIn')
export const IconWebsite  = icon(Globe,         'IconWebsite')

/* ── Прочее ── */
export const IconVideo      = icon(Video,      'IconVideo')
export const IconMap        = icon(Map,        'IconMap')
export const IconLayers     = icon(Layers,     'IconLayers')
export const IconRepeat     = icon(Repeat,     'IconRepeat')
export const IconWrite      = icon(PenLine,    'IconWrite')
export const IconGrid       = icon(Grid3x3,    'IconGrid')
export const IconText       = icon(Type,       'IconText')
export const IconLegal      = icon(Scale,      'IconLegal')
export const IconCookie     = icon(Cookie,     'IconCookie')
export const IconFolderOpen = icon(FolderOpen, 'IconFolderOpen')
export const IconBook       = icon(BookOpen,   'IconBook')
