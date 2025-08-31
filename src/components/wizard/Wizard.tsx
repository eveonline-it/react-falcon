// React 19 JSX Transform - no explicit React import needed
import WizardLayout from './WizardLayout';
import AuthWizardProvider from 'providers/AuthWizardProvider';

const Wizard = ({ variant, validation, progressBar }) => {
  return (
    <AuthWizardProvider>
      <WizardLayout
        variant={variant}
        validation={validation}
        progressBar={progressBar}
      />
    </AuthWizardProvider>
  );
};

export default Wizard;
