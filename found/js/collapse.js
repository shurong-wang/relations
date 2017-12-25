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
// const RELATION_API = 'http://192.168.1.27:8080/jstx/findRelations.do?ids=';
const RELATION_API =  '../' + RELATION_APIS[0] + '?ids=';

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


// 数据双向绑定 - 视图
const VIEW = {
    searchWrap: $('#search-wraper'),
    tagsInput: $('#tags-input'),
    relButton: $('#button-relation')
}

// 数据双向绑定 - 模型
function Company(ids = '', items = []) {
    this.ids = ids;
    this.items = items;
}

// 配置 tagsinput
VIEW.tagsInput.tagsinput({
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
});

// 视图 -> 数据
Company.prototype.bind = function (VIEW) {
    VIEW.tagsInput
        .on('beforeItemAdd beforeItemRemove', event => {
            // todo...
        })
        .on('itemAdded itemRemoved', event => {
            // ** 特别注意 this 上下文 ** //
            this.ids = VIEW.tagsInput.val();
            this.items = VIEW.tagsInput.tagsinput('items');
        });

    // 自动获取焦点
    VIEW.tagsInput.tagsinput('focus');

    // 发现关系
    VIEW.relButton.on('click', getRelation);
}

// 数据 -> 视图
Object.defineProperty(Company.prototype, 'ids', {
    set: function (ids = '') {
        const count = ids.split(',').length;
        const msg = count > 5 ? '（最多添加 5 家公司）' : (count < 2 ?
            '（至少添加 2 家公司）' : '');
        VIEW.relButton.prop('disabled', count < 2 || count > 5);
        VIEW.relButton.find('.btn-msg').text(msg);
    },
    get: function () {
        return VIEW.tagsInput.val();
    }
});
Object.defineProperty(Company.prototype, 'items', {
    set: function (items = []) {
        for (const item of items) {
            VIEW.tagsInput.tagsinput('add', item);
        }
    },
    get: function () {
        return VIEW.tagsInput.tagsinput('items');
    }
});

// 数据双向绑定
const company = new Company('', []);
company.bind(VIEW);

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
    const url = RELATION_API + company.ids;

    console.log(url);
    VIEW.searchWrap.collapse('hide');

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
            drawin(data, company.ids);

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