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
          editingTransaction={app.editingTransaction}
          saving={app.saving}
          onTransactionFormChange={app.setTransactionForm}
          onSubmit={app.handleTransactionSubmit}
          onEdit={app.startTransactionEdit}
          onCancelEdit={app.cancelTransactionEdit}
          onDelete={app.handleDeleteTransaction}
        />
      )}
      {app.activeView === 'goals' && (
        <GoalsPage
          goalForm={app.goalForm}
          categories={app.expenseCategories}
          goals={app.goals}
          editingGoal={app.editingGoal}
          saving={app.saving}
          onGoalFormChange={app.setGoalForm}
          onSubmit={app.handleGoalSubmit}
          onEdit={app.startGoalEdit}
          onCancelEdit={app.cancelGoalEdit}
          onProgress={app.handleGoalProgress}
          onDelete={app.handleDeleteGoal}
        />
      )}
      {app.activeView === 'assistant' && (
        <AssistantPage
          messages={app.chatMessages}
          chatInput={app.chatInput}
          dashboard={app.dashboard}
          score={app.score}
          welcomeMessage={app.assistantWelcomeMessage}
          suggestions={app.assistantSuggestions}
          saving={app.saving}
          onChatInputChange={app.setChatInput}
          onClearConversation={app.clearChatConversation}
          onRestartConversation={() => app.restartChatConversation(true)}
          onStartConversation={() => app.restartChatConversation(false)}
          onSubmit={app.handleChatSubmit}
        />
      )}
      {app.activeView === 'settings' && (
        <SettingsPage
          profileForm={app.profileForm}
          passwordForm={app.passwordForm}
          categoryForm={app.categoryForm}
          categories={app.categories}
          editingCategory={app.editingCategory}
          saving={app.saving}
          onProfileFormChange={app.setProfileForm}
          onPasswordFormChange={app.setPasswordForm}
          onCategoryFormChange={app.setCategoryForm}
          onProfileSubmit={app.handleProfileSubmit}
          onPasswordSubmit={app.handlePasswordSubmit}
          onCategorySubmit={app.handleCategorySubmit}
          onCategoryEdit={app.startCategoryEdit}
          onCategoryEditCancel={app.cancelCategoryEdit}
          onCategoryDelete={app.handleDeleteCategory}
        />
      )}
    </AppShell>
  )
}

export default App
