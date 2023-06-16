package com.informatica.mdm.portal.metadata.validator;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.ecore.EPackage;

/**
 * ECore Validator
 */
public interface ECoreValidator {

    Diagnostic validateEPackage(EPackage ePackage);
}
