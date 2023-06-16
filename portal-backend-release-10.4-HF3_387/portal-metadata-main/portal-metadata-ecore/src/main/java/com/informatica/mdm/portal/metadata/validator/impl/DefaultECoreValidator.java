package com.informatica.mdm.portal.metadata.validator.impl;

import com.informatica.mdm.portal.metadata.validator.ECoreValidator;
import org.eclipse.emf.common.util.BasicDiagnostic;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EClassifier;
import org.eclipse.emf.ecore.EEnum;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.util.EcoreValidator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * ECore Validator
 */
@Component
public class DefaultECoreValidator extends EcoreValidator implements ECoreValidator {

    @Override
    public Diagnostic validateEPackage(EPackage ePackage) {
        final BasicDiagnostic diagnostics = new BasicDiagnostic();
        final Map<Object,Object> context = new HashMap<>();
        validateEPackage(ePackage, diagnostics, context);
        for(EClassifier eClassifier:ePackage.getEClassifiers()) {
            validateEClassifier(diagnostics, context, eClassifier);
        }
        return diagnostics;
    }

    private void validateEClassifier(BasicDiagnostic diagnostics,
                                     Map<Object, Object> context, EClassifier eClassifier) {
        if(eClassifier instanceof EClass) {
            EClass eClass = (EClass) eClassifier;
            validateEClass(eClass, diagnostics, context);
        } else if(eClassifier instanceof EEnum) {
            EEnum eEnum = (EEnum) eClassifier;
            validateEEnum(eEnum, diagnostics, context);
        }
    }
}
