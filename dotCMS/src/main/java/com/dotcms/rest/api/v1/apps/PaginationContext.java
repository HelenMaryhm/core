package com.dotcms.rest.api.v1.apps;

import com.dotcms.rest.AbstractPaginationContext;
import com.dotcms.util.PaginationUtil;
import com.fasterxml.jackson.annotation.JsonCreator;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.QueryParam;

/**
 * This class encapsulates Pagination general params.
 */
public class PaginationContext extends AbstractPaginationContext {

    @JsonCreator
    public PaginationContext(
            @QueryParam(PaginationUtil.FILTER) final String filter,
            @DefaultValue("0")
            @QueryParam(PaginationUtil.PAGE) final int page,
            @DefaultValue("50")
            @QueryParam(PaginationUtil.PER_PAGE) final int perPage,
            @DefaultValue("name")
            @QueryParam(PaginationUtil.ORDER_BY) final String orderBy,
            @DefaultValue("ASC")
            @QueryParam(PaginationUtil.DIRECTION) final String direction) {
        super(filter, page, perPage, orderBy, direction);
    }

}
