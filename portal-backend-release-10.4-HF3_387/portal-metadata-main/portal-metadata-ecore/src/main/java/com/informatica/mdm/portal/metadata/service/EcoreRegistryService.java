package com.informatica.mdm.portal.metadata.service;

import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import org.eclipse.emf.ecore.EPackage;

import java.util.List;

public interface EcoreRegistryService {

    List<EPackage> deployEcoreModels(String ecoreLocation) throws MetaModelException;

    void unregisterEPackage(EPackage ePackage);

    void registerEPackage(EPackage ePackage);

    List<EPackage> validateEPackages(List<EPackage> ePackages);

    boolean isValidEPackage(EPackage ePackage);
}
