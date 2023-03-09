import "../css/style.css";
import { getFoodCategoryMemberList } from "./type/FoodCategory";
import { getEstimatedTimeMemberList } from "./type/EstimatedTime";
import Modal from "./component/Modal";
import Restaurants from "./domain/Restaurants";
import RestaurantValidator from "./domain/RestaurantValidator";
import Alert from "./component/Alert";
import { $ } from "./util/querySelector";
import Filter from "./domain/Filter";
import IMAGE from "./IMAGE";
import { sort } from "./domain/Sort";
import LocalStorage from "./util/LocalStorage";
import SelectInput from "./component/SelectInput";
import PersonalRestaurantInfo from "./component/PersonalRestaurantInfo";

const CATEGORY = getFoodCategoryMemberList();
const ESTIMATEDTIME = getEstimatedTimeMemberList();

const restaurantList = new Restaurants();

// 카테고리, 정렬 필터 생성
const filterContainer = $(".restaurant-filter-container");

const categoryFilterElement = SelectInput.create(
  "category-filter",
  "",
  ["전체", ...CATEGORY],
  ["전체", ...CATEGORY],
);
categoryFilterElement.setAttribute("class", "restaurant-filter");
filterContainer.appendChild(categoryFilterElement);

const sortingFilterElement = SelectInput.create(
  "sorting-filter",
  "",
  ["name", "distance"],
  ["이름순", "거리순"],
);
sortingFilterElement.setAttribute("class", "restaurant-filter");
filterContainer.appendChild(sortingFilterElement);

const categoryFilter = $("#category-filter");
const sortingFilter = $("#sorting-filter");

// 음식점 입력 모달 생성
const restaurantInputModal = Modal.create("new-restaurant-input");
$("main").appendChild(restaurantInputModal);

const addRestaurantFormTemplate = $("#new-restaurant-form-template");
const addRestaurantForm = document.importNode(addRestaurantFormTemplate.content, true);
addRestaurantForm.querySelector(".category-input").innerHTML = SelectInput.create(
  "category",
  "카테고리",
  ["", ...CATEGORY],
  ["선택해 주세요", ...CATEGORY],
).innerHTML;
addRestaurantForm.querySelector(".distance-input").innerHTML = SelectInput.create(
  "distance",
  "거리(걸리는 시간)",
  ["", ...ESTIMATEDTIME],
  ["선택해 주세요", ...ESTIMATEDTIME],
).innerHTML;
addRestaurantForm.querySelector("form").setAttribute("id", "restaurant-input-form");

Modal.setChildElement(restaurantInputModal, addRestaurantForm);

const addButton = $(".gnb__button");
addButton.querySelector("img").src = IMAGE.ADD_BTN;
addButton.addEventListener("click", () => {
  $("#restaurant-input-form").reset();
  Modal.open(restaurantInputModal);
});

// 음식점 입력 성공 모달 생성
const restaurantInputSuccessModal = Modal.create("input-success-modal");
Modal.setInnerHTML(restaurantInputSuccessModal, `
<h1>음식점 입력 성공!</h1>
<h3>전체 보기에서 확인하시겠습니까?</h3><div class="button-container">
<button type="button" id="change-category-to-all" class="button button--primary text-caption">
  네
</button>
<button type="button" id="no-change-category" class="button button--secondary text-caption">
  아니오
</button>
</div>
`);
$("main").appendChild(restaurantInputSuccessModal);

// 음식점 세부 정보 모달 생성
const restaurantDetailedModal = Modal.create("restaurant-detailed-modal");
$("main").appendChild(restaurantDetailedModal);

const makeOpenDetailedModalCallback = (restaurant) => () => {
  Modal.setChildElement(
    restaurantDetailedModal,
    PersonalRestaurantInfo.createDetailedElement(restaurant),
  );
  Modal.open(restaurantDetailedModal);
};

// 음식점 입력
const cancelButton = $("#new-restaurant-input .button--secondary");
const submitButton = $("#new-restaurant-input .button--primary");
const submitAlert = $("#alert-submit");
const linkInput = $("#link");
const linkAlert = $("#alert-link");
const catgoryInput = $("#category");
const categoryAlert = $("#alert-category");
const nameInput = $("#name");
const nameAlert = $("#alert-name");
const distanceInput = $("#distance");
const distanceAlert = $("#alert-distance");
const descriptionInput = $("#description");
const restaurantListContainer = $(".restaurant-list-container");

catgoryInput.addEventListener("focusout", () => {
  try {
    RestaurantValidator.checkCategory(catgoryInput.value);
    Alert.close(categoryAlert);
    Alert.close(submitAlert);
  } catch (e) {
    Alert.open(categoryAlert, e.message);
  }
});

nameInput.addEventListener("focusout", () => {
  try {
    RestaurantValidator.checkName(nameInput.value);
    Alert.close(nameAlert);
    Alert.close(submitAlert);
  } catch (e) {
    Alert.open(nameAlert, e.message);
  }
});

distanceInput.addEventListener("focusout", () => {
  try {
    RestaurantValidator.checkDistance(distanceInput.value);
    Alert.close(distanceAlert);
    Alert.close(submitAlert);
  } catch (e) {
    Alert.open(distanceAlert, e.message);
  }
});

linkInput.addEventListener("focusout", () => {
  try {
    RestaurantValidator.checkLink(linkInput.value);
    Alert.close(linkAlert);
    Alert.close(submitAlert);
  } catch (e) {
    Alert.open(linkAlert, e.message);
  }
});

cancelButton.addEventListener("click", () => {
  Modal.close(restaurantInputModal);
});

const readRestaurantInput = () => {
  const category = catgoryInput.value;
  const name = nameInput.value;
  const estimatedTime = distanceInput.value;
  const description = descriptionInput.value;
  const link = linkInput.value;

  return {
    category, name, estimatedTime, description, link,
  };
};

const getGlobalFilterResult = () => {
  const globalFilterValue = $("nav input[name='global-filter']:checked").value;

  if (globalFilterValue === "all") return restaurantList.getList();
  if (globalFilterValue === "favorite") return Filter.byFavorite(restaurantList.getList());
  return [];
};

const updateRestaurant = () => {
  $(".restaurant-list-container").innerHTML = "";

  LocalStorage.setItem("restaurants", restaurantList.getList());

  const globalFilteredList = getGlobalFilterResult();
  const sortResult = sort(sortingFilter.value, globalFilteredList);
  const filterResult = Filter.byCategory(categoryFilter.value, sortResult);

  filterResult.forEach((element) => {
    const summary = PersonalRestaurantInfo.createSummaryElement(element);
    restaurantListContainer.appendChild(summary);
    $(".restaurant-list-container")
      .lastElementChild
      .querySelector(".restaurant__info")
      .addEventListener("click", makeOpenDetailedModalCallback(element));
  });
};

$("#change-category-to-all").addEventListener("click", () => {
  categoryFilter.value = "전체";
  updateRestaurant();
  Modal.close(restaurantInputSuccessModal);
});

$("#no-change-category").addEventListener("click", () => {
  Modal.close(restaurantInputSuccessModal);
});

submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  const restaurant = readRestaurantInput();

  try {
    RestaurantValidator.checkAll(restaurant);
  } catch (e) {
    Alert.open(submitAlert, e.message);
    return;
  }

  restaurantList.add({ restaurant, favorite: false });
  updateRestaurant();

  Modal.close(restaurantInputModal);

  if (categoryFilter.value !== "전체" && restaurant.category !== categoryFilter.value) {
    Modal.open(restaurantInputSuccessModal);
  }
});

// 새로고침
window.addEventListener("beforeunload", () => LocalStorage.setItem("restaurants", restaurantList.getList()));

window.onload = () => {
  LocalStorage.getItem("restaurants").forEach((item) => {
    restaurantList.add(item);
  });
  updateRestaurant();
};

// 필터
categoryFilter.addEventListener("change", () => {
  updateRestaurant();
});

sortingFilter.addEventListener("change", () => {
  updateRestaurant();
});

$("#global-filter-radio").addEventListener("change", () => {
  updateRestaurant();
});

window.addEventListener("favoriteChange", () => {
  updateRestaurant();
});
