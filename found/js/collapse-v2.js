const SEARCH_API = 'assets/companies.json?keyword=';
// const SEARCH_API = 'http://192.168.1.27:8080/jstx/findCompanyMenu.do?name=';

// 企业关系 API 
const RELATION_APIS = [
    'assets/bianlifeng.simple.json',
    'assets/xiecheng.json',
    'assets/baidu.json',
    'assets/tencent.json',
    'assets/alibaba.json',
    'assets/huawei.json'
];
// const RELATION_API = 'http://192.168.1.27:8080/jstx/findRelations.do';
const RELATION_API = '../' + RELATION_APIS[0];

const relationCache = new Map();

// ajax 预配置 && 预过滤器
(function ($) {
    const pendingRequests = {};
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        const key = options.url;
        if (pendingRequests[key]) {
            pendingRequests[key].abort();
        }
        pendingRequests[key] = jqXHR;
        var complete = options.complete;
        options.complete = function (jqXHR, textStatus) {
            pendingRequests[key] = null;
            if ($.isFunction(complete)) {
                complete.apply(this, arguments);
            }
        };
    });
    $.ajaxSetup({
        timeout: 3000,
        crossDomain: true
    });
})(jQuery);


// 视图
const View = {
    searchWrap: $('#search-wraper'),
    tagsInput: $('#tags-input'),
    tagsInputTarget: $('#tags-input-target'),
    relButton: $('#button-relation')
}

// 模型
const Model = {
    source: {
        ids: '', 
        items: []
    }, 
    target: {
        ids: '', 
        items: []
    }
};

// 配置 tagsinput
const tagsinputOptions = {
    itemValue: 'id',
    itemText: 'name',
    maxTags: 5,
    maxChars: 20,
    focusClass: 'focus-class',
    onTagExists: function (item, $tag) {
        $tag.hide().fadeIn();
    },
    tagClass: 'big label tag-fill',
    typeaheadjs: {
        name: 'companies',
        displayKey: 'name',
        source: _.debounce(fetchCompanies, 300)
    }
};
View.tagsInput.tagsinput(tagsinputOptions);
View.tagsInputTarget.tagsinput(tagsinputOptions);

// 事件绑定
View.tagsInput
    .on('itemAdded itemRemoved', event => {
        // ** 特别注意 this 上下文 ** //
        Model.source.ids = View.tagsInput.val();
        Model.source.items = View.tagsInput.tagsinput('items');
        updateView();
    });
View.tagsInputTarget
    .on('itemAdded itemRemoved', event => {
        // ** 特别注意 this 上下文 ** //
        Model.target.ids = View.tagsInputTarget.val();
        Model.target.items = View.tagsInputTarget.tagsinput('items');
        updateView();
    });

View.relButton.on('click', getRelation);

// 更新视图
function updateView() {
    const {
        source: {
            ids: sIds,
            items: sItems
        }, 
        target: {
            ids: tIds,
            items: tItems
        }
    } = Model;
    const sCount = sItems.length;
    const tCount = tItems.length;
    let msg = '';
    if (!(sCount && sCount)) {
        msg = '（源、目标公司不能为空）';
    } else if (!sCount) {
        msg = '（源公司不能为空）';
    }
    else if (!tCount) {
        msg = '（目标公司不能为空）';
    }
    View.relButton.find('.btn-msg').text(msg);
    View.relButton.prop('disabled', !(sCount && tCount));

    for (const item of sItems) {
        View.tagsInput.tagsinput('add', item);
    }
    for (const item of tItems) {
        View.tagsInputTarget.tagsinput('add', item);
    }
}

updateView();

// 获取公司列表（参数格式由 tagsinput 组件决定）
function fetchCompanies(keyword, syncResults, asyncResults) {
    const url = SEARCH_API + keyword;
    if (keyword.trim().length < 2) {
        // return;
    }
    try {
        const jqxhr = $.get(url)
            .done(function (data) {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                asyncResults(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (errorThrown != 'abort') {
                    console.log(errorThrown);
                }
                if (errorThrown == 'timeout') {
                    console.error('请求超时，请稍后重试！');
                }
            });
    } catch (error) {
        console.error(error);
    }
}


// 发现关系 && 绘制关系图
function getRelation() {
    const {
        source: {ids: sIds}, 
        target: {ids: tIds}
    } = Model;
    const url = RELATION_API + `?sourceIds=${sIds}&targetIds=${tIds}`;

    console.log(url);

    View.searchWrap.collapse('hide');

    // 读取缓存数据
    const cached = relationCache.get(url);
    if (cached) {
        return cached;
    }

    const $btn = $(this).button('loading');

    const jqxhr = $.ajax({
        url: url,
        method: 'GET'
    })
        .done(function (data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            if (isSafeJSON(data)) {
                // 设置缓存数据
                relationCache.set(url, data);
            }

            //---- 画图 ----//
            drawin(data, [...sIds, ...sIds]);

        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown != 'abort') {
                console.log(errorThrown);
            }
            if (errorThrown == 'timeout') {
                console.error('请求超时，请稍后重试！');
            }
        })
        .always(function (jqXHR, textStatus, errorThrown) {
            $btn.button('reset');
        })

}

function isSafeJSON(json) {
    if ({}.toString.call(json) === '[object Object]') {
        for (const key in json) {
            return true;
        }
    }
    return false;
}