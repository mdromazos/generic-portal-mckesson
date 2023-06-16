package com.informatica.mdm.portal.metadata.util;

import static org.junit.Assert.assertNotNull;

import java.text.DateFormat;
import java.text.FieldPosition;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest({PortalConfigUtil.class})
public class PortalConfigUtilTest {

	@Mock
	SimpleDateFormat sDateFormat;
	
	@Mock
	DateFormat dateFormat;
	
	@Mock
	Date date;
	
	
	@Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
    }
	
	@Test
	public void testFormatDate() throws Exception {
		PowerMockito.whenNew(SimpleDateFormat.class).withArguments(Mockito.anyString()).thenReturn(sDateFormat);
		PowerMockito.when(sDateFormat.format(Mockito.any(Date.class), Mockito.any(StringBuffer.class), Mockito.any(FieldPosition.class))).thenReturn(new StringBuffer("date"));
		assertNotNull(PortalConfigUtil.formatDate(date));
	}

}
