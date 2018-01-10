// 公司搜索 API
const SEARCH_COMPANY = 'searchCompany';
// 关系发现 API
const FIND_RELATIONS = 'shortPath';
// 关系数据缓存
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
        // timeout: 3000,
        crossDomain: true
    });
})(jQuery);


// 视图
const View = {
    searchShortpath: $('#search-shortpath'),
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


// 展开搜索
// View.searchShortpath.collapse('show');

$('#button-collapse').on('click', function () {
    const expanded = $(this).attr('aria-expanded') === 'false';
    // $(this).find('.collapse-text').text(expanded ? '收起公司' : '添加公司');
    $(this).find('.chevron').toggleClass('glyphicon-chevron-down');
});

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

    $('.source-grp-msg').text(sCount < 1 ? '*至少添加 1 家源公司' : (sCount > 3 ? '*最多添加 3 家源公司' : ''));
    $('.target-grp-msg').text(tCount < 1 ? '*至少添加 1 家目标公司' : (tCount > 3 ? '*最多添加 3 家目标公司' : ''));

    View.relButton.prop('disabled', (sCount < 1 || sCount > 3 || tCount < 1 || tCount > 3));

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
    const url = api(SEARCH_COMPANY, { name: keyword });
    if (keyword.trim().length < 2) {
        return;
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
    // View.searchShortpath.collapse('hide');

    console.log('getRelation...');
    
    // const {
    //     source: { ids: sIds },
    //     target: { ids: tIds }
    // } = Model;
    // const url = api(FIND_RELATIONS, {sourceIds: sIds, targetIds: tIds});
    // const url = api(FIND_RELATIONS, { companyId: sIds + ',' + tIds });

    const sIds = "431";
    const tIds = "246010";
    const url = '../js/config/data/shortpath.json';

    // 读取缓存数据
    const cached = relationCache.get(url);
    if (cached) {
        return cached;
    }

    const $btn = View.relButton.button('loading');

    const jqxhr = $.ajax({
        url: url,
        method: 'GET'
    })
        .done(function (data) {

            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (error) {
                    console.error('无法解析 JOSN 格式错误！', url);
                    return;
                }
            }
            if (isSafeJSON(data)) {
                // 设置缓存数据
                relationCache.set(url, data);
            }

            //---- 画图 ----//
            renderForce(data, [sIds, tIds]);

            //---- 生成关系列表 ----//
            genPathList([sIds, tIds]);

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

function genPathList(ids) {
    const url = '../js/config/data/shortpath.json';
    const defalutIds = '431,246010';
    const jqxhr = $.get(url)
        .done(function (data) {

            const { nodes, paths } = data;
            const nodesMap = {};
            nodes.map(node => {
                const id = (node.properties && node.properties.id) 
                    ? node.properties.id 
                    : node.id;
                if (!nodesMap[id]) {
                    nodesMap[id] = {
                        id,
                        name: node.properties ? node.properties.name : node.name,
                        ntype: node.labels ? node.labels + '' : node.ntype
                    };
                }
            });
            
            const pathList = paths;
            const icon = (i, l) => i === 0 || i === l - 1 ? 'glyphicon-record' : 'glyphicon-arrow-down';
            const iconFn = (i, l) => `<span class="glyphicon ${icon(i, l)}" aria-hidden="true"></span>`;
            const ul = pathList.map(path => {
                const l = path.length;
                const li = path.map((id, i) => `<li>${iconFn(i, l)} ${nodesMap[id].name}</li>`).join('');
                return `<ul>${li}</ul>`;
            });
            const html = ul.join('');
            $('#shortpath-list-inner').html(html);
        });
}

function isSafeJSON(json) {
    if ({}.toString.call(json) === '[object Object]') {
        for (const key in json) {
            return true;
        }
    }
    return false;
}