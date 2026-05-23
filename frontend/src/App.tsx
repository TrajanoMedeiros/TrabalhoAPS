import { LoadingScreen } from './components/LoadingScreen'
import { useSaldooApp } from './hooks/useSaldooApp'
import { AppShell } from './layouts/AppShell'
import { AssistantPage } from './pages/AssistantPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { GoalsPage } from './pages/GoalsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TransactionsPage } from './pages/TransactionsPage'

function App() {
  const app = useSaldooApp()

  if (!app.token) {
    return (
      <AuthPage
        authMode={app.authMode}
        authForm={app.authForm}
        error={app.error}
        isSaving={app.saving === 'auth'}
        onAuthModeChange={app.setAuthMode}
        onSubmit={app.handleAuth}
        onAuthFormChange={app.setAuthForm}
      />
    )
  }

  if (app.booting) {
    return <LoadingScreen />
  }

  return (
    <AppShell
      activeView={app.activeView}
      user={app.user}
      dashboard={app.dashboard}
      month={app.month}
      year={app.year}
      years={app.years}
      loading={app.loading}
      error={app.error}
      notice={app.notice}
      onMonthChange={app.setMonth}
      onYearChange={app.setYear}
      onRefresh={() => void app.refreshData()}
      onLogout={app.logout}
      onViewChange={app.setActiveView}
    >
      {app.activeView === 'dashboard' && (
        <DashboardPage
          dashboard={app.dashboard}
          score={app.score}
          history={app.history}
          transactions={app.transactions}
          onTransactionDelete={app.handleDeleteTransaction}
          saving={app.saving}
        />
      )}
      {app.activeView === 'transactions' && (
        <TransactionsPage
          transactionForm={app.transactionForm}
          categories={app.transactionCategories}
          transactions={app.transactions}
          saving={app.saving}
          onTransactionFormChange={app.setTransactionForm}
          onSubmit={app.handleTransactionSubmit}
          onDelete={app.handleDeleteTransaction}
        />
      )}
      {app.activeView === 'goals' && (
        <GoalsPage
          goalForm={app.goalForm}
          categories={app.expenseCategories}
          goals={app.goals}
          saving={app.saving}
          onGoalFormChange={app.setGoalForm}
          onSubmit={app.handleGoalSubmit}
          onProgress={app.handleGoalProgress}
          onDelete={app.handleDeleteGoal}
        />
      )}
      {app.activeView === 'assistant' && (
        <AssistantPage
          messages={app.chatMessages}
          chatInput={app.chatInput}
          saving={app.saving}
          onChatInputChange={app.setChatInput}
          onSubmit={app.handleChatSubmit}
        />
      )}
      {app.activeView === 'settings' && (
        <SettingsPage
          profileForm={app.profileForm}
          passwordForm={app.passwordForm}
          categoryForm={app.categoryForm}
          categories={app.categories}
          saving={app.saving}
          onProfileFormChange={app.setProfileForm}
          onPasswordFormChange={app.setPasswordForm}
          onCategoryFormChange={app.setCategoryForm}
          onProfileSubmit={app.handleProfileSubmit}
          onPasswordSubmit={app.handlePasswordSubmit}
          onCategorySubmit={app.handleCategorySubmit}
          onCategoryDelete={app.handleDeleteCategory}
        />
      )}
    </AppShell>
  )
}

export default App
