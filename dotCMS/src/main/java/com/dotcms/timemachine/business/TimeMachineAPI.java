package com.dotcms.timemachine.business;

import java.io.File;
import java.util.Date;
import java.util.List;

import com.dotcms.publishing.PublishStatus;
import com.dotmarketing.beans.Host;
import com.dotmarketing.exception.DotDataException;
import com.dotmarketing.exception.DotRuntimeException;
import com.dotmarketing.portlets.languagesmanager.model.Language;
import com.dotmarketing.quartz.ScheduledTask;

public interface TimeMachineAPI {

	public List<Date> getAvailableTimeMachineForSite(Host host) throws DotDataException;

    public ScheduledTask getQuartzJob();

    public List<String> getAvailableLangForTimeMachine(Host host, Date date);

    public List<Host> getHostsWithTimeMachine();

    List<PublishStatus> startTimeMachine(List<Host> hosts, List<Language> langs, boolean incremental);

    void setQuartzJobConfig(String cronExp, List<Host> hosts, boolean allhost, List<Language> langs, boolean incremental);

    void removeQuartzJob() throws DotRuntimeException;

    /**
     * Prunes all Time Machine backup folders that are older than the value specified
     * in the PRUNE_TIMEMACHINE_OLDER_THAN_DAYS configuration property.
     *
     * @return A List containing all the files that were deleted.
     */
    List<File> removeOldTimeMachineBackupsFiles();
	
}
